'use strict';
const test = require('node:test');
const assert = require('node:assert');
const U = require('./sim.js');
// Scenario uten regelen om ledig gang, for å teste de andre reglene for seg.
const strict = (id) => ({ ...U.SCENARIOS.find((s) => s.id === id), freeGo: false });

test('alle 180 kommer ut i alle scenarier, uten at noe låser seg', () => {
  for (const s of U.SCENARIOS) {
    for (let seed = 1; seed <= 15; seed++) {
      const sim = U.createSim(s.id, seed, { otherRowShare: 0.6, impatientShare: 0.3, slowShare: 0.3 });
      sim.run();
      assert.strictEqual(sim.out, 180, `${s.id} frø ${seed}`);
    }
  }
});

test('samme frø gir samme resultat', () => {
  assert.strictEqual(U.createSim('fritt', 3).run(), U.createSim('fritt', 3).run());
});

test('når døra åpnes, står de klare på midtgangssetene i midtgangen, maks én per rad', () => {
  const sim = U.createSim('rad', 9);
  const inAisle = sim.agents.filter((a) => a.cell > 0);
  assert.ok(inAisle.length > 15 && inAisle.length <= U.PARAMS.rows);
  assert.strictEqual(new Set(inAisle.map((a) => a.cell)).size, inAisle.length);
  for (const a of inAisle) assert.ok(a.group === 'aisle' && a.preReady && !a.needBag);
});

test('strenge bølger uten utålmodige: ingen midtsete går før siste midtgangssete er ute', () => {
  const sim = U.createSim('bolger', 11, { impatientShare: 0 });
  sim.run();
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  for (const a of sim.agents.filter((x) => x.group !== 'aisle')) assert.ok(a.enterT > lastAisleOut);
});

test('ditt forslag: de som går før bølgen sin, har bagasjen klar og fletter inn', () => {
  const sim = U.createSim(strict('forslag'), 11, { impatientShare: 0 });
  sim.run();
  const merged = sim.agents.filter((a) => a.merged);
  assert.ok(merged.length > 10);
  for (const a of merged) { assert.ok(a.seatBagger); assert.strictEqual(a.needBag, false); }
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  for (const a of sim.agents.filter((x) => x.group !== 'aisle' && x.enterT < lastAisleOut)) assert.ok(a.merged);
});

test('uten innfletting går ingen før bølgen sin', () => {
  const sim = U.createSim('forslag-uten-innfletting', 11, { impatientShare: 0 });
  sim.run();
  assert.strictEqual(sim.agents.filter((a) => a.merged).length, 0);
});

test('utålmodige går før tur', () => {
  const sim = U.createSim('bolger', 5, { impatientShare: 0.2 });
  sim.run();
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  assert.ok(sim.agents.some((a) => a.group !== 'aisle' && a.impatient && a.enterT < lastAisleOut));
});

test('de som har kofferten bak seg går bakover og henter den', () => {
  const sim = U.createSim('fritt', 4, { otherRowShare: 0.5 });
  const backers = sim.agents.filter((a) => a.bagRow > a.row && !a.preReady);
  assert.ok(backers.length > 0);
  const maxCell = new Map();
  while (!sim.done) {
    sim.step();
    for (const a of backers) if (a.cell > (maxCell.get(a) ?? -1)) maxCell.set(a, a.cell);
  }
  for (const a of backers) assert.ok(maxCell.get(a) >= a.bagRow, `sete ${a.row}${a.letter}`);
});

test('midtgangen har aldri to personer i samme celle', () => {
  const sim = U.createSim('fritt', 2, { otherRowShare: 0.5 });
  while (!sim.done) {
    sim.step();
    const cells = sim.agents.filter((a) => ['bag', 'wait', 'back', 'door'].includes(a.state)).map((a) => a.cell);
    assert.strictEqual(new Set(cells).size, cells.length);
  }
});

test('business: tomt midtsete i rad 1–4 gir 172 passasjerer', () => {
  const sim = U.createSim('rad', 1, { businessRows: 4 });
  assert.strictEqual(sim.total, 172);
  assert.ok(!sim.agents.some((a) => a.business && a.group === 'middle'));
  assert.ok(sim.agents.filter((a) => a.business).every((a) => a.bagRow <= 4));
  assert.ok(sim.agents.filter((a) => !a.business).every((a) => a.bagRow > 4));
});

test('business først: ingen fra økonomi går ut før siste businesspassasjer er ute', () => {
  for (const s of U.SCENARIOS) {
    const sim = U.createSim(s.id, 6, { businessRows: 4, businessFirst: true, impatientShare: 0.3 });
    sim.run();
    assert.strictEqual(sim.out, 172, s.id);
    const lastBusiness = Math.max(...sim.agents.filter((a) => a.business).map((a) => a.exitT));
    for (const a of sim.agents.filter((x) => !x.business)) assert.ok(a.exitT > lastBusiness, s.id);
  }
});

test('bakre dør: ingen flyging låser seg (alle scenarier, 1–3 min, 25 flyginger hver)', () => {
  for (const s of U.SCENARIOS) {
    for (const at of [60, 120, 180]) {
      for (let sd = 1; sd <= 25; sd++) {
        const sim = U.createSim(s.id, sd, { rearDoorAt: at });
        sim.run();
        assert.strictEqual(sim.out, 180, `${s.id}, ${at} s, frø ${sd}`);
      }
    }
  }
});

test('bakre dør: alle kommer ut i alle scenarier, ingen bakover før døra åpnes', () => {
  for (const s of U.SCENARIOS) {
    for (const at of [60, 120, 180]) {
      const sim = U.createSim(s.id, 3, { rearDoorAt: at, otherRowShare: 0.5, impatientShare: 0.2 });
      sim.run();
      assert.strictEqual(sim.out, 180, `${s.id} ${at}`);
      const rear = sim.agents.filter((a) => a.exitDoor === 'rear');
      assert.ok(rear.length > 20, `${s.id} ${at}: ${rear.length} ut bak`);
      for (const a of rear) {
        assert.ok(a.exitT > at, `${s.id} ${at}`);
        assert.ok(a.row > U.PARAMS.rearSplit, `${s.id} ${at}: rad ${a.row} gikk bak`);
      }
    }
  }
});

test('bakre dør: høflig rad for rad tømmer bakre halvdel bakfra etter åpning', () => {
  const sim = U.createSim(strict('rad'), 4, { rearDoorAt: 60, impatientShare: 0 });
  sim.run();
  const firstEnter = (row) => Math.min(...sim.agents.filter((a) => a.row === row && a.enterT > 60).map((a) => a.enterT));
  // Én rads overlapp: raden går tidligst samtidig med raden bak, men aldri før raden to bak.
  for (let row = U.PARAMS.rearSplit + 1; row <= U.PARAMS.rows - 2; row++) assert.ok(firstEnter(row) >= firstEnter(row + 2), 'rad ' + row);
});

test('ledig gang: vinduspassasjerer sitter ikke og venter når gangen bak dem er tom', () => {
  for (const id of ['rad', 'forslag', 'beste']) {
    const sim = U.createSim(id, 2);
    let idle = 0;
    while (!sim.done) {
      sim.step();
      const occupied = new Set(sim.agents.filter((a) => a.depth === 0 && a.cell >= 0 && a.state !== 'out').map((a) => a.cell));
      let emptyFrom = U.PARAMS.rows + 1;
      for (let c = U.PARAMS.rows; c >= 1 && !occupied.has(c); c--) emptyFrom = c;
      for (const a of sim.agents) {
        if (a.group !== 'window' || a.cell >= 0 || a.go || !(a.state === 'seated' || a.state === 'ready')) continue;
        const blocked = sim.agents.some((b) => b !== a && b.row === a.row && b.side === a.side && b.cell < 0 && b.state !== 'out' && b.depth < a.depth);
        if (a.row >= emptyFrom && !blocked) idle += U.PARAMS.dt;
      }
    }
    // Under 1 minutt samlet per fly (uten regelen var det 6–8 minutter).
    assert.ok(idle < 60, `${id}: ${idle.toFixed(0)} s`);
  }
});
