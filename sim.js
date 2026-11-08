/*
 * Utstigning fra Boeing 737-800 gjennom bare fremre venstre dør.
 *
 * Cellebasert agentmodell: midtgangen er én celle per rad pluss byssa ved døra
 * (celle 0). Hver celle rommer én person. Passasjerer reiser seg, flytter seg
 * sidelengs mot midtgangen, henter bagasje stående i midtgangen og går fremover.
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
    walk: [0.55, 0.85],    // s per rad i midtgangen (setedeling ca. 0,76 m)
    standUp: [2, 4],       // s å reise seg fra midtgangssetet
    seatStep: [1.5, 3],    // s per sete sidelengs mot midtgangen
    bagShare: 0.7,         // andel med bagasje i hylla
    bagMedian: 8,          // s, median tid for å hente bagasje
    bagSigma: 0.5,         // lognormal spredning
    bagMax: 30,            // s, øvre grense
    noBag: [1, 3],         // s å ta med seg ting uten hyllebagasje
    doorTime: 1.0,         // s fra byssa og ut døra
    yieldP: 0.5,
    readyBagRate: 0.7,     // bagasjen tas ned 30 % saktere når man står foroverbøyd ved setet           // sjanse for at en som venter på setet slipper inn før en som går i midtgangen
    maxTime: 3600,
  };

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
    const rowLeft = new Int16Array(R + 2);   // personer i raden som ikke er i midtgangen ennå
    const rowEntered = new Int16Array(R + 2);   // personer fra raden som har gått ut i midtgangen
    const rowEnteredNA = new Int16Array(R + 2); // det samme, bare midt- og vindusseter
    const groupTotal = { aisle: 0, middle: 0, window: 0 };
    const groupLeft = { aisle: 0, middle: 0, window: 0 }; // ikke i midtgangen ennå
    const groupOut = { aisle: 0, middle: 0, window: 0 };

    for (let row = 1; row <= R; row++) {
      for (const s of SEATS) {
        const bag = r() < P.bagShare;
        const a = {
          id: agents.length, row, letter: s.letter, side: s.side, depth: s.depth, seatDepth: s.depth,
          group: s.group, bag,
          bagT: bag ? Math.min(P.bagMax, lognormal(r, P.bagMedian, P.bagSigma)) : uni(r, P.noBag),
          walkT: uni(r, P.walk),
          state: 'seated', go: false, standing: false,
          timer: 0, timerMax: 0, cell: -1, from: -1, exitT: null, enterT: null,
        };
        a.bagLeft = a.bagT;
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

    // Rad r får gå når alle rader før den forrige er ute av setene, og den forrige raden
    // har begynt å gå (én rads overlapp, slik folk gjør i praksis). `na` teller bare
    // midt- og vindusseter, brukt i fase 2 etter at midtgangssetene er tømt.
    function computeClear() {
      const startedF = (row) => (rowEnteredNA[row] > 0 || (!naPhase() && rowEntered[row] > 0) || rowLeft[row] === 0);
      frontClear[1] = 1;
      let doneBefore = 1; // alle rader 1..r-2 er ute av setene
      for (let row = 2; row <= R; row++) {
        if (row >= 3) doneBefore = doneBefore && rowLeft[row - 2] === 0 ? 1 : 0;
        frontClear[row] = doneBefore && startedF(row - 1) ? 1 : 0;
      }
      backClear[R] = 1;
      doneBefore = 1;
      for (let row = R - 1; row >= 1; row--) {
        if (row <= R - 2) doneBefore = doneBefore && rowLeft[row + 2] === 0 ? 1 : 0;
        backClear[row] = doneBefore && startedF(row + 1) ? 1 : 0;
      }
    }
    const naPhase = () => scenarioId !== 'rad';

    function released(a) {
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

    function enterAisle(a, c) {
      seatOcc[seatKey(a.row, a.side, a.depth)] = null;
      aisle[c] = a;
      a.cell = c; a.from = c; a.depth = 0;
      a.state = 'bag'; a.timer = Math.max(0.3, a.bagLeft); a.timerMax = a.bagT;
      a.enterT = t;
      rowLeft[a.row]--; groupLeft[a.group]--;
      rowEntered[a.row]++;
      if (a.group !== 'aisle') rowEnteredNA[a.row]++;
    }

    function step() {
      const dt = P.dt;
      t += dt;
      computeClear();

      // 1. Tidtakere og beslutninger på setet.
      for (let i = 0; i < N; i++) {
        const a = agents[i];
        switch (a.state) {
          case 'seated':
            if (!a.go && released(a)) a.go = true;
            if (!a.go) break;
            if (a.depth === 1) {
              if (a.standing) a.state = 'ready';
              else { a.state = 'rising'; setTimer(a, uni(r, P.standUp)); }
            } else if (seatOcc[seatKey(a.row, a.side, a.depth - 1)] === null) {
              seatOcc[seatKey(a.row, a.side, a.depth - 1)] = a; // reserver setet innenfor
              a.state = 'shuffle';
              setTimer(a, uni(r, P.seatStep) + (a.standing ? 0 : uni(r, P.standUp) * 0.5));
              a.standing = true;
            }
            break;
          case 'rising':
            a.timer -= dt;
            if (a.timer <= 0) { a.state = 'ready'; a.standing = true; }
            break;
          case 'ready':
            // Står ved midtgangssetet og venter på plass i midtgangen: kan ta ned bagasjen imens.
            if (a.bagLeft > 0) a.bagLeft -= dt * P.readyBagRate;
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
            if (a.timer <= 0) a.state = 'wait';
            break;
          case 'move':
            a.timer -= dt;
            if (a.timer <= 0) {
              aisle[a.from] = null;
              a.from = a.cell;
              if (a.cell === 0) { a.state = 'door'; setTimer(a, P.doorTime); }
              else a.state = 'wait';
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

      // 2. Fordel ledige midtgangsceller forfra og bakover.
      for (let c = 0; c <= R; c++) {
        if (aisle[c] !== null) continue;
        const behind = c + 1 <= R ? aisle[c + 1] : null;
        const walker = behind && behind.state === 'wait' && behind.cell === c + 1 ? behind : null;
        let seatCand = null;
        if (c >= 1) {
          const L = seatOcc[seatKey(c, -1, 1)], Rr = seatOcc[seatKey(c, 1, 1)];
          const lOk = L && L.state === 'ready' && L.depth === 1;
          const rOk = Rr && Rr.state === 'ready' && Rr.depth === 1;
          if (lOk && rOk) seatCand = r() < 0.5 ? L : Rr;
          else if (lOk) seatCand = L;
          else if (rOk) seatCand = Rr;
        }
        if (seatCand && (!walker || r() < P.yieldP)) {
          enterAisle(seatCand, c);
        } else if (walker) {
          aisle[c] = walker;
          walker.from = c + 1; walker.cell = c;
          walker.state = 'move'; setTimer(walker, walker.walkT);
        }
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

  // Kjør mange flyginger med ulike passasjerer. Samme frø gir samme passasjerer i alle scenarier.
  function summarize(scenarioId, runs, seedBase, overrides) {
    const times = [];
    for (let i = 0; i < runs; i++) times.push(createSim(scenarioId, (seedBase || 1) + i, overrides).run());
    const sorted = times.slice().sort((x, y) => x - y);
    const mean = times.reduce((s, x) => s + x, 0) / times.length;
    return {
      id: scenarioId, runs,
      mean, p10: quantile(sorted, 0.1), median: quantile(sorted, 0.5), p90: quantile(sorted, 0.9),
      min: sorted[0], max: sorted[sorted.length - 1],
    };
  }

  return { PARAMS, SEATS, SCENARIOS, createSim, summarize };
});
