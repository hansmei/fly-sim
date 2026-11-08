'use strict';
const test = require('node:test');
const assert = require('node:assert');
const U = require('./sim.js');

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
  const sim = U.createSim('forslag', 11, { impatientShare: 0 });
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
