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

  const SCENARIOS = [
    {
      id: 'rad',
      name: 'Rad for rad forfra',
      short: 'Vanlig praksis',
      desc: 'Hver rad venter på tur. Neste rad reiser seg når raden foran begynner å gå ut i midtgangen. Slik går det for seg i dag når folk er høflige.',
    },
    {
      id: 'fritt',
      name: 'Fritt fram',
      short: 'Alle går når de vil',
      desc: 'Alle prøver å komme seg ut i midtgangen så snart det er en ledig plass ved raden deres.',
    },
    {
      id: 'midtgang-bakfra',
      name: 'Midtgangsseter først, så resten bakfra',
      short: 'Ditt forslag',
      desc: 'Alle på midtgangssetene (C og D) går først. Midt- og vindussetene venter til den siste av dem har gått ut døra. Deretter tømmes flyet rad for rad bakfra, med samme overlapp som vanlig praksis.',
    },
    {
      id: 'midtgang-forfra',
      name: 'Midtgangsseter først, så resten forfra',
      short: 'Som forslaget, men forfra',
      desc: 'Samme første fase, men når midtgangssetene er ute, tømmes resten rad for rad forfra.',
    },
    {
      id: 'midtgang-overlapp',
      name: 'Midtgangsseter først, resten bakfra uten pause',
      short: 'Forslaget uten venting',
      desc: 'Midt- og vindussetene starter bakfra så snart alle på midtgangssetene har kommet seg ut i midtgangen, uten å vente til de er ute av flyet.',
    },
    {
      id: 'bolger',
      name: 'Tre bølger: midtgang, midtsete, vindu',
      short: 'Sete for sete',
      desc: 'Først alle midtgangssetene, så alle midtsetene, så alle vindussetene. Hver bølge går fritt, men venter til forrige bølge er helt ute.',
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
    if (!SCENARIOS.some((s) => s.id === scenarioId)) throw new Error('Ukjent scenario: ' + scenarioId);
    const r = mulberry32(seed >>> 0);
    const R = P.rows;

    const agents = [];
    const seatOcc = new Array((R + 1) * 8).fill(null); // indeks: row*8 + (side<0?0:4) + depth
    const seatKey = (row, side, depth) => row * 8 + (side < 0 ? 0 : 4) + depth;
    const aisle = new Array(R + 1).fill(null);
    const rowLeft = new Int16Array(R + 2);      // personer i raden som ikke er i midtgangen ennå
    const rowEntered = new Int16Array(R + 2);   // personer fra raden som har gått ut i midtgangen
    const rowEnteredNA = new Int16Array(R + 2); // det samme, bare midt- og vindusseter
    const groupTotal = { aisle: 0, middle: 0, window: 0 };
    const groupLeft = { aisle: 0, middle: 0, window: 0 }; // ikke i midtgangen ennå
    const groupOut = { aisle: 0, middle: 0, window: 0 };

    // Passasjerene trekkes alltid med de samme tilfeldige tallene i samme rekkefølge,
    // så samme frø gir samme passasjerer i alle scenarier.
    for (let row = 1; row <= R; row++) {
      for (const s of SEATS) {
        const u = { bag: r(), slow: r(), slowF: r(), seatBag: r(), other: r(), which: r(), imp: r() };
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
          id: agents.length, row, letter: s.letter, side: s.side, depth: s.depth, seatDepth: s.depth,
          group: s.group, bag, bagRow, bagT, bagLeft: bagT, needBag: true,
          pace, slow, seatBagger: bag && bagRow === row && u.seatBag < P.seatBagShare,
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

    const N = agents.length;
    const frontClear = new Uint8Array(R + 2);
    const backClear = new Uint8Array(R + 2);
    let t = 0, out = 0;
    const naPhase = scenarioId !== 'rad';

    // Rad r får gå når alle rader før den forrige er ute av setene, og den forrige raden
    // har begynt å gå (én rads overlapp, slik folk gjør i praksis). I fasebaserte scenarier
    // teller bare midt- og vindusseter som «begynt», siden midtgangssetene alt er tømt.
    function computeClear() {
      const started = (row) => rowEnteredNA[row] > 0 || (!naPhase && rowEntered[row] > 0) || rowLeft[row] === 0;
      frontClear[1] = 1;
      let doneBefore = 1;
      for (let row = 2; row <= R; row++) {
        if (row >= 3) doneBefore = doneBefore && rowLeft[row - 2] === 0 ? 1 : 0;
        frontClear[row] = doneBefore && started(row - 1) ? 1 : 0;
      }
      backClear[R] = 1;
      doneBefore = 1;
      for (let row = R - 1; row >= 1; row--) {
        if (row <= R - 2) doneBefore = doneBefore && rowLeft[row + 2] === 0 ? 1 : 0;
        backClear[row] = doneBefore && started(row + 1) ? 1 : 0;
      }
    }

    function released(a) {
      if (a.impatient) return true;
      switch (scenarioId) {
        case 'rad': return frontClear[a.row] === 1;
        case 'fritt': return true;
        case 'midtgang-bakfra':
          return a.group === 'aisle' || (groupOut.aisle === groupTotal.aisle && backClear[a.row] === 1);
        case 'midtgang-forfra':
          return a.group === 'aisle' || (groupOut.aisle === groupTotal.aisle && frontClear[a.row] === 1);
        case 'midtgang-overlapp':
          return a.group === 'aisle' || (groupLeft.aisle === 0 && backClear[a.row] === 1);
        case 'bolger':
          if (a.group === 'aisle') return true;
          if (a.group === 'middle') return groupOut.aisle === groupTotal.aisle;
          return groupOut.aisle === groupTotal.aisle && groupOut.middle === groupTotal.middle;
      }
      return false;
    }

    function phase() {
      switch (scenarioId) {
        case 'midtgang-bakfra':
        case 'midtgang-forfra':
          return groupOut.aisle < groupTotal.aisle ? 'Fase 1: midtgangssetene går ut' : 'Fase 2: midt- og vindusseter, ' + (scenarioId === 'midtgang-bakfra' ? 'bakfra' : 'forfra');
        case 'midtgang-overlapp':
          return groupLeft.aisle > 0 ? 'Fase 1: midtgangssetene går ut' : 'Fase 2: midt- og vindusseter bakfra';
        case 'bolger':
          if (groupOut.aisle < groupTotal.aisle) return 'Bølge 1: midtgangsseter';
          if (groupOut.middle < groupTotal.middle) return 'Bølge 2: midtseter';
          return 'Bølge 3: vindusseter';
        case 'rad': return 'Rad for rad forfra';
        default: return 'Alle går når de kan';
      }
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
      aisle[c] = a;
      a.cell = c; a.from = c; a.depth = 0;
      a.enterT = t;
      rowLeft[a.row]--; groupLeft[a.group]--;
      rowEntered[a.row]++;
      if (a.group !== 'aisle') rowEnteredNA[a.row]++;
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
            if (!a.go) break;
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
          const lOk = L && L.state === 'ready' && L.depth === 1;
          const rOk = Rr && Rr.state === 'ready' && Rr.depth === 1;
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
