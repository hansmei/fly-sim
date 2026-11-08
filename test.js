'use strict';
const test = require('node:test');
const assert = require('node:assert');
const U = require('./sim.js');

test('alle 180 kommer ut i alle scenarier', () => {
  for (const s of U.SCENARIOS) {
    const sim = U.createSim(s.id, 7);
    sim.run();
    assert.strictEqual(sim.out, 180, s.id);
    assert.ok(sim.t < U.PARAMS.maxTime, s.id);
  }
});

test('samme frø gir samme resultat', () => {
  assert.strictEqual(U.createSim('fritt', 3).run(), U.createSim('fritt', 3).run());
});

test('ditt forslag: ingen midt- eller vindusseter går før siste midtgangssete er ute', () => {
  const sim = U.createSim('midtgang-bakfra', 11);
  sim.run();
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  for (const a of sim.agents.filter((x) => x.group !== 'aisle')) assert.ok(a.enterT > lastAisleOut);
});

test('ditt forslag: fase 2 går bakfra', () => {
  const sim = U.createSim('midtgang-bakfra', 5);
  sim.run();
  const firstEnter = (row) => Math.min(...sim.agents.filter((a) => a.row === row && a.group !== 'aisle').map((a) => a.enterT));
  for (let row = 1; row < U.PARAMS.rows; row++) assert.ok(firstEnter(row) >= firstEnter(row + 1), 'rad ' + row);
});

test('midtgangen har aldri to personer i samme celle', () => {
  const sim = U.createSim('fritt', 2);
  while (!sim.done) {
    sim.step();
    const cells = sim.agents.filter((a) => a.state === 'bag' || a.state === 'wait' || a.state === 'door').map((a) => a.cell);
    assert.strictEqual(new Set(cells).size, cells.length);
  }
});
