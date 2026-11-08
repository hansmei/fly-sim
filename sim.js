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
    mergeGap: 2,           // «klar bane»: så mange plasser bak i midtgangen må være tomme for å flette inn
    squeezeTime: 2.5,      // s å presse seg forbi én person i midtgangen
    backWinP: 0.3,         // sjanse for at en som skal bakover får en ledig plass før en som skal fremover
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

  // waves: bølger midtgang -> midtsete -> vindu, der hver bølge venter til forrige er ute.
  // prep: de som venter, kan flytte seg inn mot midtgangen og ta ned bagasjen imens.
  // merge: de som er klare, fletter inn når det er klar bane bak dem i midtgangen.
  const SCENARIOS = [
    {
      id: 'rad',
      name: 'Rad for rad forfra',
      short: 'Vanlig praksis',
      desc: 'Hver rad venter på tur. Neste rad reiser seg når raden foran begynner å gå ut i midtgangen. De som alt står i midtgangen, går når køen beveger seg.',
    },
    {
      id: 'fritt',
      name: 'Fritt fram',
      short: 'Alle går når de vil',
      desc: 'Alle prøver å komme seg ut i midtgangen så snart det er en ledig plass ved raden deres.',
    },
    {
      id: 'bolger',
      name: 'Tre bølger, alle sitter til sin tur',
      short: 'Strenge bølger',
      desc: 'Først midtgangssetene, så midtsetene, så vindussetene. Hver bølge venter sittende til forrige bølge er helt ute, og går så ut i gangen og tar ned bagasjen samtidig.',
      waves: true,
    },
    {
      id: 'forslag-uten-innfletting',
      name: 'Tre bølger, gjør seg klare imens',
      short: 'Forslaget uten innfletting',
      desc: 'Som ditt forslag, men ingen går før bølgen sin. De som venter, flytter seg inn på det ledige setet mot midtgangen og tar ned bagasjen der.',
      waves: true, prep: true,
    },
    {
      id: 'forslag',
      name: 'Tre bølger med innfletting',
      short: 'Ditt forslag',
      desc: 'Midtgangssetene går først. Imens flytter midt- og vinduspassasjerer seg inn på det ledige midtgangssetet og tar ned bagasjen. Er de klare og det er klar bane i midtgangen, går de ut. Ellers venter de. Når midtgangssetene er ute, går alle på midtsetet ut i gangen samtidig, og til slutt vindussetene.',
      waves: true, prep: true, merge: true,
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

  function createSim(scenarioId, seed, overrides) {
    const P = Object.assign({}, PARAMS, overrides || {});
    const S = SCENARIOS.find((x) => x.id === scenarioId);
    if (!S) throw new Error('Ukjent scenario: ' + scenarioId);
    const r = mulberry32(seed >>> 0);
    const R = P.rows;

    const agents = [];
    const seatOcc = new Array((R + 1) * 8).fill(null); // indeks: row*8 + (side<0?0:4) + depth
    const seatKey = (row, side, depth) => row * 8 + (side < 0 ? 0 : 4) + depth;
    const aisle = new Array(R + 1).fill(null);
    const rowLeft = new Int16Array(R + 2);      // personer i raden som ikke er i midtgangen ennå
    const rowEntered = new Int16Array(R + 2);   // personer fra raden som har gått ut i midtgangen
    const groupTotal = { aisle: 0, middle: 0, window: 0 };
    const groupLeft = { aisle: 0, middle: 0, window: 0 }; // ikke i midtgangen ennå
    const groupOut = { aisle: 0, middle: 0, window: 0 };

    // Passasjerene trekkes alltid med de samme tilfeldige tallene i samme rekkefølge,
    // så samme frø gir samme passasjerer i alle scenarier.
    for (let row = 1; row <= R; row++) {
      for (const s of SEATS) {
        const u = { bag: r(), slow: r(), slowF: r(), seatBag: r(), other: r(), which: r(), imp: r(), pre: r() };
        const bag = u.bag < P.bagShare;
        const slow = u.slow < P.slowShare;
        const pace = slow ? P.slowFactor[0] + (P.slowFactor[1] - P.slowFactor[0]) * u.slowF : lognormal(r, 1, P.paceSigma);
        let bagRow = row;
        if (bag && u.other < P.otherRowShare) {
          let acc = 0;
          for (const o of OTHER_ROW) { acc += o.share; if (u.which < acc) { bagRow = row + o.offset; break; } }
          bagRow = Math.max(1, Math.min(R, bagRow));
        }
        const bagT = (bag ? Math.min(P.bagMax, lognormal(r, P.bagMedian, P.bagSigma)) : uni(r, P.noBag)) * pace;
        const a = {
          id: agents.length, row, merged: false, letter: s.letter, side: s.side, depth: s.depth, seatDepth: s.depth,
          group: s.group, bag, bagRow, bagT, bagLeft: bagT, needBag: true,
          // Tar ned bagasjen (eller samler jakke og ting) mens de står ved setet og venter.
          pace, slow, seatBagger: !bag || (bagRow === row && u.seatBag < P.seatBagShare),
          preReady: s.group === 'aisle' && u.pre < P.preReadyShare,
          impatient: u.imp < P.impatientShare,
          walkT: uni(r, P.walk) * pace,
          state: 'seated', go: false, standing: false,
          timer: 0, timerMax: 0, cell: -1, from: -1, exitT: null, enterT: null, partner: null,
        };
        agents.push(a);
        seatOcc[seatKey(row, s.side, s.depth)] = a;
        rowLeft[row]++;
        groupTotal[s.group]++;
        groupLeft[s.group]++;
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
        rowLeft[row]--; groupLeft[a.group]--; rowEntered[row]++;
      }
    }

    const N = agents.length;
    const frontClear = new Uint8Array(R + 2);
    let t = 0, out = 0;

    // Rad r får gå når alle rader før den forrige er ute av setene, og den forrige raden
    // har begynt å gå (én rads overlapp, slik folk gjør i praksis).
    function computeClear() {
      frontClear[1] = 1;
      let doneBefore = 1;
      for (let row = 2; row <= R; row++) {
        if (row >= 3) doneBefore = doneBefore && rowLeft[row - 2] === 0 ? 1 : 0;
        frontClear[row] = doneBefore && (rowEntered[row - 1] > 0 || rowLeft[row - 1] === 0) ? 1 : 0;
      }
    }

    function released(a) {
      if (a.impatient) return true;
      if (S.waves) {
        if (a.group === 'aisle') return true;
        if (a.group === 'middle') return groupOut.aisle === groupTotal.aisle;
        return groupOut.aisle === groupTotal.aisle && groupOut.middle === groupTotal.middle;
      }
      if (scenarioId === 'rad') return frontClear[a.row] === 1;
      return true;
    }

    // Klar til å flette inn: har bagasjen i hånda og står ved midtgangssetet.
    const prepared = (a) => a.seatBagger && a.bagLeft <= 0 && a.state === 'ready';
    function clearBehind(c) {
      for (let k = 1; k <= P.mergeGap && c + k <= R; k++) if (aisle[c + k] !== null) return false;
      return true;
    }
    function mayEnter(a, c) {
      if (a.state !== 'ready' || a.depth !== 1) return false;
      if (a.go) return true;
      return !!S.merge && prepared(a) && clearBehind(c);
    }

    function phase() {
      if (S.waves) {
        if (groupOut.aisle < groupTotal.aisle) return 'Bølge 1: midtgangsseter' + (S.merge ? '. Klare fra andre seter fletter inn' : '');
        if (groupOut.middle < groupTotal.middle) return 'Bølge 2: midtseter' + (S.merge ? '. Klare vinduspassasjerer fletter inn' : '');
        return 'Bølge 3: vindusseter';
      }
      return scenarioId === 'rad' ? 'Rad for rad forfra' : 'Alle går når de kan';
    }

    function setTimer(a, s) { a.timer = s; a.timerMax = s; }

    // Bestem hva en som nettopp har kommet til en celle i midtgangen skal gjøre.
    function arrive(a) {
      if (a.cell === 0 && !a.needBag) { a.state = 'door'; setTimer(a, P.doorTime); return; }
      if (a.needBag && a.cell === a.bagRow) {
        a.state = 'bag'; a.timer = Math.max(0.3, a.bagLeft); a.timerMax = a.bagT;
      } else if (a.needBag && a.bagRow > a.cell) a.state = 'back';
      else a.state = 'wait';
    }

    function enterAisle(a, c) {
      seatOcc[seatKey(a.row, a.side, a.depth)] = null;
      if (!a.go) a.merged = true; // flettet inn før sin egen bølge
      a.go = true;
      if (a.bagLeft <= 0 && a.bagRow === a.row) a.needBag = false;
      aisle[c] = a;
      a.cell = c; a.from = c; a.depth = 0;
      a.enterT = t;
      rowLeft[a.row]--; groupLeft[a.group]--;
      rowEntered[a.row]++;
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

      // 1. Tidtakere og beslutninger.
      for (let i = 0; i < N; i++) {
        const a = agents[i];
        switch (a.state) {
          case 'seated':
            if (!a.go && released(a)) a.go = true;
            // Uten tillatelse kan man i noen scenarier likevel gjøre seg klar ved setet.
            if (!a.go && !(S.prep && a.seatBagger)) break;
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
            if (a.timer <= 0) { a.needBag = false; a.bagLeft = 0; a.state = a.cell === 0 ? 'door' : 'wait'; if (a.cell === 0) setTimer(a, P.doorTime); }
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
              aisle[0] = null;
              a.state = 'out'; a.cell = -1; a.exitT = t;
              out++; groupOut[a.group]++;
            }
            break;
        }
      }

      // 2. En som skal bakover og har en som vil fremover rett bak seg, presser seg forbi.
      for (let c = 1; c < R; c++) {
        const a = aisle[c], b = aisle[c + 1];
        if (a && b && a.state === 'back' && a.cell === c && b.state === 'wait' && b.cell === c + 1) {
          a.state = 'squeezeBack'; b.state = 'squeeze';
          a.partner = b; b.partner = a;
          a.from = c; a.cell = c + 1; b.from = c + 1; b.cell = c;
          setTimer(a, P.squeezeTime * Math.max(a.pace, b.pace)); setTimer(b, a.timer);
        }
      }

      // 3. Fordel ledige midtgangsceller forfra og bakover.
      for (let c = 0; c <= R; c++) {
        if (aisle[c] !== null) continue;
        const ahead = c >= 1 ? aisle[c - 1] : null;
        const behind = c + 1 <= R ? aisle[c + 1] : null;
        const walker = behind && behind.state === 'wait' && behind.cell === c + 1 ? behind : null;
        const backer = ahead && ahead.state === 'back' && ahead.cell === c - 1 ? ahead : null;
        let seatCand = null;
        if (c >= 1) {
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
