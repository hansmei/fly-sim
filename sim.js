/*
 * Utstigning fra Boeing 737-800 gjennom bare fremre venstre dør.
 *
 * Cellebasert agentmodell: midtgangen er én celle per rad pluss byssa ved døra
 * (celle 0). Hver celle rommer én person. Passasjerer reiser seg, flytter seg
 * sidelengs mot midtgangen, henter bagasje og går mot døra.
 *
 * Atferd som er med:
 * - Hver passasjer har sitt eget tempo, og noen er klart trege.
 * - Noen tar ned bagasjen mens de står ved setet og venter, også fra midtsetet.
 * - Noen er utålmodige og går ut i midtgangen før det er deres tur.
 * - Når døra åpnes, står de fleste på midtgangssetene allerede klare med bagasjen,
 *   en i midtgangen per rad og den andre ved setet sitt.
 * - Noen har kofferten en rad foran (plukker den opp på vei ut) eller en til to
 *   rader bak (går mot strømmen, presser seg forbi folk og blokkerer imens).
 *
 * Valgfritt: bakre dør (2L) som åpnes etter en gitt tid. Da snur alle i bakre halvdel,
 * også de som alt står i midtgangen, og går bakover.
 *
 * Valgfritt: business i de forreste radene med tomt midtsete. Skal business gå
 * først, holder forhenget økonomi tilbake til siste businesspassasjer er ute.
 *
 * Fungerer både i nettleseren (global `Utstigning`) og i Node (module.exports).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Utstigning = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PARAMS = {
    rows: 30,              // 30 rader × 6 seter = 180 passasjerer (fullt fly)
    dt: 0.1,               // tidssteg i sekunder
    walk: [0.55, 0.85],    // s per rad i midtgangen (setedeling ca. 0,76 m), før tempo
    standUp: [2, 4],       // s å reise seg fra midtgangssetet
    seatStep: [1.5, 3],    // s per sete sidelengs mot midtgangen
    bagShare: 0.7,         // andel med bagasje i hylla
    bagMedian: 8,          // s, median tid for å hente bagasje
    bagSigma: 0.5,         // lognormal spredning
    bagMax: 30,            // s, øvre grense
    noBag: [1, 3],         // s å ta med seg ting uten hyllebagasje
    doorTime: 1.0,         // s fra byssa og ut døra
    yieldP: 0.5,           // sjanse for at en som står ved setet slipper inn før en som går i midtgangen
    paceSigma: 0.15,       // spredning i tempo for vanlige passasjerer (1 = middels)
    slowShare: 0.1,        // andel trege passasjerer
    slowFactor: [1.4, 2.0],// de trege bruker så mange ganger lengre tid på alt
    seatBagShare: 0.6,     // andel som tar ned bagasjen fra setet mens de venter
    seatBagRate: [0.7, 0.5], // fart på bagasjehenting stående ved midtgangssetet / i midtsetet
    otherRowShare: 0.3,    // andel med bagasjen i en annen rad enn sin egen
    impatientShare: 0.1,   // andel som går ut i midtgangen før det er deres tur
    preReadyShare: 0.7,    // andel på midtgangssetene som står klare med bagasjen når døra åpnes
    mergeGap: 1,           // «klar bane»: så mange plasser bak i midtgangen må være tomme for å flette inn (1 var best i optimize.js)
    squeezeTime: 2.5,      // s å presse seg forbi én person i midtgangen
    backWinP: 0.3,         // sjanse for at en som skal bakover får en ledig plass før en som skal fremover
    loadFactor: 1,         // andel solgte seter; tomme seter trekkes tilfeldig
    rearDoorAt: null,      // sekunder til bakre dør (2L) åpnes; null = bare fremre dør
    rearSplit: 15,         // når bakre dør er åpen, går rad 16 og bakover dit
    businessRows: 0,       // rader med business forrest (midtsetet står tomt der)
    businessFirst: false,  // business går først; forhenget holder økonomi tilbake til de er ute
    maxTime: 3600,
  };

  // Hvor kofferten ligger når den ikke ligger i egen rad (negativt tall = nærmere døra).
  const OTHER_ROW = [
    { offset: -1, share: 0.375 }, // en rad foran
    { offset: 1, share: 0.375 },  // en rad bak
    { offset: 2, share: 0.25 },   // to rader bak
  ];

  // Sete -> side (-1 venstre, 1 høyre), dybde fra midtgangen og gruppe.
  const SEATS = [
    { letter: 'A', side: -1, depth: 3, group: 'window' },
    { letter: 'B', side: -1, depth: 2, group: 'middle' },
    { letter: 'C', side: -1, depth: 1, group: 'aisle' },
    { letter: 'D', side: 1, depth: 1, group: 'aisle' },
    { letter: 'E', side: 1, depth: 2, group: 'middle' },
    { letter: 'F', side: 1, depth: 3, group: 'window' },
  ];

  // Et scenario er enten rad for rad (kind 'rad'), fritt fram (kind 'fritt') eller en
  // liste av grupper som slippes etter tur (groups). En gruppe skrives som setebokstaver,
  // eventuelt med rader: 'CD' = midtgangssetene, 'CD@16-30' = midtgangssetene i rad 16–30,
  // 'ABCDEF@odd' = alle seter i oddetallsrader.
  // trigger: når neste gruppe slippes. Et tall er andelen av forrige gruppe som må være ute
  //   av flyet (1 = alle), 'entered' betyr at alle i forrige gruppe har forlatt setet.
  // prep: de som venter, kan flytte seg inn mot midtgangen og ta ned bagasjen imens.
  // merge: de som er klare, fletter inn når det er klar bane bak dem (true = PARAMS.mergeGap
  //   tomme plasser, eller et tall).
  // freeGo: er midtgangen tom ved raden og hele veien bakover (mot døra de skal til), og ingen
  //   bak er på vei ut, går man selv om det ikke er ens tur. Da hindres ingen.
  const WAVE_LABELS = ['Bølge 1: midtgangsseter', 'Bølge 2: midtseter', 'Bølge 3: vindusseter'];
  const SCENARIOS = [
    {
      id: 'rad',
      name: 'Høflig rad for rad',
      short: 'Rad for rad',
      kind: 'rad',
      desc: 'Slik det ville gått om alle var høflige. Hver rad venter på tur. Er bakre dør åpen, tømmes bakre halvdel rad for rad bakfra. Neste rad reiser seg når raden foran begynner å gå ut i midtgangen. De som alt står i midtgangen, går når køen beveger seg. Er gangen tom ved raden og bakover, går man uten å vente på tur.',
      freeGo: true,
    },
    {
      id: 'fritt',
      name: 'Vanlig praksis: alle går når de kan',
      short: 'Vanlig praksis',
      kind: 'fritt',
      desc: 'Slik det går for seg i dag: alle prøver å komme seg ut i midtgangen så snart det er en ledig plass ved raden deres.',
    },
    {
      id: 'bolger',
      name: 'Tre bølger, alle sitter til sin tur',
      short: 'Strenge bølger',
      desc: 'Først midtgangssetene, så midtsetene, så vindussetene. Hver bølge venter sittende til forrige bølge er helt ute, og går så ut i gangen og tar ned bagasjen samtidig.',
      groups: ['CD', 'BE', 'AF'], labels: WAVE_LABELS,
    },
    {
      id: 'forslag-uten-innfletting',
      name: 'Tre bølger, gjør seg klare imens',
      short: 'Forslaget uten innfletting',
      desc: 'Som ditt forslag, men ingen går før bølgen sin. De som venter, flytter seg inn på det ledige setet mot midtgangen og tar ned bagasjen der.',
      groups: ['CD', 'BE', 'AF'], labels: WAVE_LABELS, prep: true,
    },
    {
      id: 'forslag',
      name: 'Tre bølger med innfletting',
      short: 'Ditt forslag',
      desc: 'Midtgangssetene går først. Imens flytter midt- og vinduspassasjerer seg inn på det ledige midtgangssetet og tar ned bagasjen. Er de klare og det er klar bane i midtgangen, går de ut. Ellers venter de. Når midtgangssetene er ute, går alle på midtsetet ut i gangen samtidig, og til slutt vindussetene. Er gangen helt tom bak raden, går man selv om man ikke er klar.',
      groups: ['CD', 'BE', 'AF'], labels: WAVE_LABELS, prep: true, merge: true, freeGo: true,
    },
    {
      id: 'beste',
      name: 'Seks bølger, bakre halvdel først',
      short: 'Beste regel funnet',
      desc: 'Den raskeste regelen optimize.js fant, statistisk likt med ditt forslag. Som ditt forslag, men hver bølge deles i to: først rad 16–30, så rad 1–15. Neste bølge slippes når forrige er ute, og de som er klare, fletter inn når plassen rett bak er tom. Er gangen helt tom bak raden, går man selv om det ikke er ens tur.',
      groups: ['CD@16-30', 'CD@1-15', 'BE@16-30', 'BE@1-15', 'AF@16-30', 'AF@1-15'],
      labels: ['Bølge 1: midtgangsseter, rad 16–30', 'Bølge 2: midtgangsseter, rad 1–15', 'Bølge 3: midtseter, rad 16–30',
        'Bølge 4: midtseter, rad 1–15', 'Bølge 5: vindusseter, rad 16–30', 'Bølge 6: vindusseter, rad 1–15'],
      trigger: 1, prep: true, merge: true, freeGo: true,
    },
  ];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const uni = (r, range) => range[0] + (range[1] - range[0]) * r();
  function lognormal(r, median, sigma) {
    const u1 = r() || 1e-9, u2 = r();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return median * Math.exp(sigma * z);
  }

  function parseGroup(spec) {
    const [letters, rows] = spec.split('@');
    let test = () => true;
    if (rows === 'odd') test = (row) => row % 2 === 1;
    else if (rows === 'even') test = (row) => row % 2 === 0;
    else if (rows) { const [lo, hi] = rows.split('-').map(Number); test = (row) => row >= lo && row <= hi; }
    return { letters, rows: test };
  }

  function createSim(scenarioId, seed, overrides) {
    const P = Object.assign({}, PARAMS, overrides || {});
    const S = typeof scenarioId === 'string' ? SCENARIOS.find((x) => x.id === scenarioId) : scenarioId;
    if (!S) throw new Error('Ukjent scenario: ' + scenarioId);
    const kind = S.kind || 'groups';
    const groups = kind === 'groups' ? S.groups.map(parseGroup) : [];
    const G = groups.length;
    const trigger = S.trigger === undefined ? 1 : S.trigger;
    const mergeGap = S.merge === true ? P.mergeGap : (S.merge || 0);
    const r = mulberry32(seed >>> 0);
    const R = P.rows;

    const agents = [];
    const seatOcc = new Array((R + 1) * 8).fill(null); // indeks: row*8 + (side<0?0:4) + depth
    const seatKey = (row, side, depth) => row * 8 + (side < 0 ? 0 : 4) + depth;
    // Midtgangen: celle 0 er byssa ved fremre dør, 1..R er radene, R+1 er bakre bysse.
    const aisle = new Array(R + 2).fill(null);
    const hasRear = P.rearDoorAt !== null && P.rearDoorAt !== undefined;
    const lastCell = hasRear ? R + 1 : R;
    let rearOpen = false, outRear = 0;
    const rowLeft = new Int16Array(R + 2);      // personer i raden som ikke er i midtgangen ennå
    const rowEntered = new Int16Array(R + 2);   // personer fra raden som har gått ut i midtgangen
    const gTotal = new Int16Array(G + 1); // per gruppe: antall
    const gLeft = new Int16Array(G + 1);  // ... som ikke har forlatt setet ennå
    const gOut = new Int16Array(G + 1);   // ... som er ute av flyet

    // Passasjerene trekkes alltid med de samme tilfeldige tallene i samme rekkefølge,
    // så samme frø gir samme passasjerer i alle scenarier.
    const B = Math.max(0, Math.min(R - 1, P.businessRows | 0));
    // Egen tallrekke for tomme seter, så resten av passasjerene blir like ved full kabin.
    const rSeat = mulberry32((seed ^ 0x9e3779b9) >>> 0);
    for (let row = 1; row <= R; row++) {
      for (const s of SEATS) {
        const business = row <= B;
        if (business && s.group === 'middle') continue; // tomt midtsete på business
        if (P.loadFactor < 1 && rSeat() >= P.loadFactor) continue; // usolgt sete
        const u = { bag: r(), slow: r(), slowF: r(), seatBag: r(), other: r(), which: r(), imp: r(), pre: r() };
        const bag = u.bag < P.bagShare;
        const slow = u.slow < P.slowShare;
        const pace = slow ? P.slowFactor[0] + (P.slowFactor[1] - P.slowFactor[0]) * u.slowF : lognormal(r, 1, P.paceSigma);
        let bagRow = row;
        if (bag && u.other < P.otherRowShare) {
          let acc = 0;
          for (const o of OTHER_ROW) { acc += o.share; if (u.which < acc) { bagRow = row + o.offset; break; } }
          // Bagasjen ligger i samme kabin: business foran forhenget, økonomi bak.
          bagRow = business ? Math.max(1, Math.min(B, bagRow)) : Math.max(B + 1, Math.min(R, bagRow));
        }
        const bagT = (bag ? Math.min(P.bagMax, lognormal(r, P.bagMedian, P.bagSigma)) : uni(r, P.noBag)) * pace;
        const a = {
          id: agents.length, row, merged: false, business, dir: -1, exitDoor: null, letter: s.letter, side: s.side, depth: s.depth, seatDepth: s.depth,
          group: s.group, bag, bagRow, bagT, bagLeft: bagT, needBag: true,
          // Tar ned bagasjen (eller samler jakke og ting) mens de står ved setet og venter.
          pace, slow, seatBagger: !bag || (bagRow === row && u.seatBag < P.seatBagShare),
          preReady: s.group === 'aisle' && u.pre < P.preReadyShare,
          impatient: u.imp < P.impatientShare,
          walkT: uni(r, P.walk) * pace,
          state: 'seated', go: false, standing: false,
          timer: 0, timerMax: 0, cell: -1, from: -1, exitT: null, enterT: null, partner: null,
        };
        // Gruppe: første gruppe som passer. Business som går først, står utenfor gruppene.
        a.gi = G === 0 || (business && P.businessFirst) ? G : groups.findIndex((g) => g.letters.includes(s.letter) && g.rows(row));
        if (a.gi < 0) a.gi = G;
        agents.push(a);
        seatOcc[seatKey(row, s.side, s.depth)] = a;
        rowLeft[row]++;
        gTotal[a.gi]++; gLeft[a.gi]++;
      }
    }

    // Når døra åpnes: de klare på midtgangssetene står med bagasjen i hånda.
    // Én per rad står i midtgangen, den andre ved setet sitt.
    for (let row = 1; row <= R; row++) {
      const ready = agents.filter((a) => a.row === row && a.preReady);
      for (const a of ready) { a.standing = true; a.bagLeft = 0; a.needBag = false; a.state = 'ready'; }
      if (ready.length) {
        const a = ready.length === 2 && r() < 0.5 ? ready[1] : ready[0];
        seatOcc[seatKey(row, a.side, a.depth)] = null;
        aisle[row] = a;
        a.cell = row; a.from = row; a.depth = 0; a.enterT = 0; a.go = true; a.state = 'wait';
        rowLeft[row]--; gLeft[a.gi]--; rowEntered[row]++;
      }
    }

    const N = agents.length;
    const frontClear = new Uint8Array(R + 2);
    const backClear = new Uint8Array(R + 2);
    // Ledig gang: freeBack[c] = ingen i midtgangen og ingen på vei ut fra rad c og bakover.
    // freeFront[c] = det samme fra rad c og fremover til rearSplit+1 (mot bakre dør).
    const freeBack = new Uint8Array(R + 3);
    const freeFront = new Uint8Array(R + 2);
    const pendingGo = new Int16Array(R + 2);
    let t = 0, out = 0;
    let relIdx = G > 0 ? 1 : 0; // antall grupper som er sluppet

    // Rad r får gå når alle rader før den forrige er ute av setene, og den forrige raden
    // har begynt å gå (én rads overlapp, slik folk gjør i praksis).
    function groupDone(k) {
      if (trigger === 'entered') return gLeft[k] === 0;
      return gOut[k] >= Math.ceil(trigger * gTotal[k] - 1e-9);
    }
    function computeClear() {
      while (relIdx < G && groupDone(relIdx - 1)) relIdx++;
      frontClear[1] = 1;
      let doneBefore = 1;
      for (let row = 2; row <= R; row++) {
        if (row >= 3) doneBefore = doneBefore && rowLeft[row - 2] === 0 ? 1 : 0;
        frontClear[row] = doneBefore && (rowEntered[row - 1] > 0 || rowLeft[row - 1] === 0) ? 1 : 0;
      }
      if (S.freeGo) {
        pendingGo.fill(0);
        for (const a of agents) if (a.go && a.cell < 0 && a.state !== 'out') pendingGo[a.row]++;
        freeBack[R + 1] = 1;
        for (let c = R; c >= 1; c--) freeBack[c] = freeBack[c + 1] && aisle[c] === null && pendingGo[c] === 0 ? 1 : 0;
        if (rearOpen) {
          freeFront[P.rearSplit] = 1;
          for (let c = P.rearSplit + 1; c <= R; c++) freeFront[c] = freeFront[c - 1] && aisle[c] === null && pendingGo[c] === 0 ? 1 : 0;
        }
      }
      // Med bakre dør åpen: bakre halvdel tømmes rad for rad bakfra, mot bakre dør.
      if (rearOpen) {
        backClear[R] = 1;
        doneBefore = 1;
        for (let row = R - 1; row > P.rearSplit; row--) {
          if (row <= R - 2) doneBefore = doneBefore && rowLeft[row + 2] === 0 ? 1 : 0;
          backClear[row] = doneBefore && (rowEntered[row + 1] > 0 || rowLeft[row + 1] === 0) ? 1 : 0;
        }
      }
    }

    let businessLeft = agents.filter((a) => a.business).length;
    const curtainClosed = () => P.businessFirst && businessLeft > 0;

    function released(a) {
      if (a.impatient) return true;
      if (a.business && P.businessFirst) return true;
      if (kind === 'groups') return a.gi >= G || a.gi < relIdx;
      if (kind === 'rad') return rearOpen && a.row > P.rearSplit ? backClear[a.row] === 1 : frontClear[a.row] === 1;
      return true;
    }

    // Klar til å flette inn: har bagasjen i hånda og står ved midtgangssetet.
    const prepared = (a) => a.seatBagger && a.bagLeft <= 0 && a.state === 'ready';
    function clearBehind(c) {
      for (let k = 1; k <= mergeGap && c + k <= R; k++) if (aisle[c + k] !== null) return false;
      return true;
    }
    // Ledig gang ved raden: plassen ved raden er tom, og ingen bak (mot døra man skal til) trenger forbi.
    function aisleFree(row) {
      if (!S.freeGo || aisle[row] !== null) return false;
      if (rearOpen && row > P.rearSplit) return freeFront[row - 1] === 1;
      return freeBack[row + 1] === 1;
    }
    function mayEnter(a, c) {
      if (a.state !== 'ready' || a.depth !== 1) return false;
      if (a.go) return true;
      if (aisleFree(c) && !(curtainClosed() && !a.business)) return true;
      return mergeGap > 0 && prepared(a) && clearBehind(c);
    }

    function phase() {
      const p = basePhase();
      if (!hasRear) return p;
      if (!rearOpen) return `${p}. Bakre dør åpnes om ${Math.max(0, Math.ceil(P.rearDoorAt - t))} s`;
      return `${p}. Bakre dør er åpen for rad ${P.rearSplit + 1}–${R}`;
    }
    function basePhase() {
      if (curtainClosed()) return 'Business går ut først. Økonomi gjør seg klar bak forhenget';
      if (kind === 'groups') {
        const k = Math.min(relIdx, G) - 1;
        const label = S.labels ? S.labels[k] : `Gruppe ${k + 1} av ${G}: ${S.groups[k].replace('@', ', rad ')}`;
        return label + (mergeGap > 0 && k < G - 1 ? '. Klare fra senere grupper fletter inn' : '');
      }
      return kind === 'rad' ? 'Rad for rad forfra' : 'Alle går når de kan';
    }

    function setTimer(a, s) { a.timer = s; a.timerMax = s; }

    // Bestem hva en som nettopp har kommet til en celle i midtgangen skal gjøre.
    // 'wait' = vil én plass fremover, 'back' = vil én plass bakover.
    function arrive(a) {
      if (!a.needBag) {
        const doorCell = a.dir < 0 ? 0 : R + 1;
        if (a.cell === doorCell) { a.state = 'door'; setTimer(a, P.doorTime); return; }
        a.state = a.dir < 0 ? 'wait' : 'back';
        return;
      }
      if (a.cell === a.bagRow) {
        a.state = 'bag'; a.timer = Math.max(0.3, a.bagLeft); a.timerMax = a.bagT;
      } else a.state = a.bagRow > a.cell ? 'back' : 'wait';
    }
    const goesRear = (pos) => rearOpen && pos > P.rearSplit;

    function enterAisle(a, c) {
      seatOcc[seatKey(a.row, a.side, a.depth)] = null;
      if (!a.go) a.merged = true; // flettet inn før sin egen bølge
      a.go = true;
      if (a.bagLeft <= 0 && a.bagRow === a.row) a.needBag = false;
      aisle[c] = a;
      a.cell = c; a.from = c; a.depth = 0;
      a.enterT = t;
      rowLeft[a.row]--; gLeft[a.gi]--;
      rowEntered[a.row]++;
      if (goesRear(a.row)) a.dir = 1;
      arrive(a);
    }

    function startMove(a, to) {
      aisle[to] = a; // reserver målcellen; den gamle frigjøres ved ankomst
      a.from = a.cell; a.cell = to;
      a.state = to < a.from ? 'move' : 'moveBack';
      setTimer(a, a.walkT * (to < a.from ? 1 : 1.3));
    }

    function step() {
      const dt = P.dt;
      t += dt;
      computeClear();

      // Bakre dør åpnes: alle i bakre halvdel snur, også de som står i midtgangen.
      if (hasRear && !rearOpen && t >= P.rearDoorAt) {
        rearOpen = true;
        for (const a of agents) {
          if (a.state === 'out' || a.state === 'door') continue;
          // Posisjon: plassen i midtgangen (også byssa, plass 0), ellers raden de sitter i.
          const inAisle = a.depth === 0 && a.cell >= 0;
          if (goesRear(inAisle ? a.cell : a.row)) {
            a.dir = 1;
            if (a.state === 'wait' || a.state === 'back') arrive(a);
          }
        }
      }

      // 1. Tidtakere og beslutninger.
      for (let i = 0; i < N; i++) {
        const a = agents[i];
        switch (a.state) {
          case 'seated':
            if (!a.go && released(a)) a.go = true;
            // Uten tillatelse kan man i noen scenarier likevel gjøre seg klar ved setet.
            if (!a.go && !(S.prep && a.seatBagger) && !aisleFree(a.row)) break;
            // Står i midtsetet og venter: kan ta ned bagasjen herfra.
            if (a.standing && a.depth === 2 && a.seatBagger && a.bagLeft > 0) a.bagLeft -= dt * P.seatBagRate[1];
            if (a.depth === 1) {
              if (a.standing) a.state = 'ready';
              else { a.state = 'rising'; setTimer(a, uni(r, P.standUp) * a.pace); }
            } else if (seatOcc[seatKey(a.row, a.side, a.depth - 1)] === null) {
              seatOcc[seatKey(a.row, a.side, a.depth - 1)] = a;
              a.state = 'shuffle';
              setTimer(a, (uni(r, P.seatStep) + (a.standing ? 0 : uni(r, P.standUp) * 0.5)) * a.pace);
              a.standing = true;
            }
            break;
          case 'rising':
            a.timer -= dt;
            if (a.timer <= 0) { a.state = 'ready'; a.standing = true; }
            break;
          case 'ready':
            if (!a.go && released(a)) a.go = true;
            // Står ved midtgangssetet og venter på plass i midtgangen.
            if (a.seatBagger && a.bagLeft > 0) a.bagLeft -= dt * P.seatBagRate[0];
            break;
          case 'shuffle':
            a.timer -= dt;
            if (a.timer <= 0) {
              seatOcc[seatKey(a.row, a.side, a.depth)] = null;
              a.depth -= 1;
              a.state = a.depth === 1 ? 'ready' : 'seated';
            }
            break;
          case 'bag':
            a.timer -= dt;
            if (a.timer <= 0) { a.needBag = false; a.bagLeft = 0; arrive(a); }
            break;
          case 'move':
          case 'moveBack':
            a.timer -= dt;
            if (a.timer <= 0) { aisle[a.from] = null; a.from = a.cell; arrive(a); }
            break;
          case 'squeeze':
            a.timer -= dt;
            break;
          case 'squeezeBack':
            // Den som skal bakover styrer byttet; begge bruker samme tid.
            a.timer -= dt;
            if (a.timer <= 0) {
              const b = a.partner;
              aisle[a.cell] = a; aisle[b.cell] = b;
              a.from = a.cell; b.from = b.cell;
              a.partner = b.partner = null;
              arrive(a); arrive(b);
            }
            break;
          case 'door':
            a.timer -= dt;
            if (a.timer <= 0) {
              aisle[a.cell] = null;
              a.exitDoor = a.cell === 0 ? 'front' : 'rear';
              if (a.exitDoor === 'rear') outRear++;
              a.state = 'out'; a.cell = -1; a.exitT = t;
              out++; gOut[a.gi]++;
              if (a.business) businessLeft--;
            }
            break;
        }
      }

      // 2. En som skal bakover og har en som vil fremover rett bak seg, presser seg forbi.
      for (let c = 1; c < lastCell; c++) {
        const a = aisle[c], b = aisle[c + 1];
        if (a && b && a.state === 'back' && a.cell === c && b.state === 'wait' && b.cell === c + 1) {
          a.state = 'squeezeBack'; b.state = 'squeeze';
          a.partner = b; b.partner = a;
          a.from = c; a.cell = c + 1; b.from = c + 1; b.cell = c;
          setTimer(a, P.squeezeTime * Math.max(a.pace, b.pace)); setTimer(b, a.timer);
        }
      }

      // 3. Fordel ledige midtgangsceller forfra og bakover.
      for (let c = 0; c <= lastCell; c++) {
        if (aisle[c] !== null) continue;
        const ahead = c >= 1 ? aisle[c - 1] : null;
        const behind = c + 1 <= lastCell ? aisle[c + 1] : null;
        let walker = behind && behind.state === 'wait' && behind.cell === c + 1 ? behind : null;
        // Forhenget: økonomi kommer ikke forbi rad B før business er ute.
        if (walker && c <= B && !walker.business && curtainClosed()) walker = null;
        const backer = ahead && ahead.state === 'back' && ahead.cell === c - 1 ? ahead : null;
        let seatCand = null;
        if (c >= 1 && c <= R) {
          const L = seatOcc[seatKey(c, -1, 1)], Rr = seatOcc[seatKey(c, 1, 1)];
          const lOk = L && mayEnter(L, c);
          const rOk = Rr && mayEnter(Rr, c);
          if (lOk && rOk) seatCand = r() < 0.5 ? L : Rr;
          else if (lOk) seatCand = L;
          else if (rOk) seatCand = Rr;
        }
        if (backer && (!(walker || seatCand) || r() < P.backWinP)) startMove(backer, c);
        else if (seatCand && (!walker || r() < P.yieldP)) enterAisle(seatCand, c);
        else if (walker) startMove(walker, c);
      }
    }

    return {
      params: P,
      agents,
      get t() { return t; },
      get out() { return out; },
      get total() { return N; },
      get businessRows() { return B; },
      get curtainClosed() { return curtainClosed(); },
      get hasRear() { return hasRear; },
      get rearOpen() { return rearOpen; },
      get outRear() { return outRear; },
      get done() { return out === N || t >= P.maxTime; },
      get phase() { return phase(); },
      step,
      run() { while (!(out === N || t >= P.maxTime)) step(); return t; },
    };
  }

  function quantile(sorted, q) {
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  function stats(scenarioId, times) {
    const sorted = times.slice().sort((x, y) => x - y);
    return {
      id: scenarioId, runs: times.length,
      mean: times.reduce((s, x) => s + x, 0) / times.length,
      p10: quantile(sorted, 0.1), median: quantile(sorted, 0.5), p90: quantile(sorted, 0.9),
      min: sorted[0], max: sorted[sorted.length - 1],
    };
  }

  // Kjør mange flyginger med ulike passasjerer. Samme frø gir samme passasjerer i alle scenarier.
  function summarize(scenarioId, runs, seedBase, overrides) {
    const times = [];
    for (let i = 0; i < runs; i++) times.push(createSim(scenarioId, (seedBase || 1) + i, overrides).run());
    return stats(scenarioId, times);
  }

  return { PARAMS, SEATS, SCENARIOS, OTHER_ROW, createSim, summarize, stats };
});
