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

test('ditt forslag uten utålmodige: ingen midt- eller vindusseter går før siste midtgangssete er ute', () => {
  const sim = U.createSim('midtgang-bakfra', 11, { impatientShare: 0 });
  sim.run();
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  for (const a of sim.agents.filter((x) => x.group !== 'aisle')) assert.ok(a.enterT > lastAisleOut);
});

test('ditt forslag uten utålmodige: fase 2 går bakfra', () => {
  const sim = U.createSim('midtgang-bakfra', 5, { impatientShare: 0 });
  sim.run();
  const firstEnter = (row) => Math.min(...sim.agents.filter((a) => a.row === row && a.group !== 'aisle').map((a) => a.enterT));
  for (let row = 1; row < U.PARAMS.rows; row++) assert.ok(firstEnter(row) >= firstEnter(row + 1), 'rad ' + row);
});

test('utålmodige går før tur', () => {
  const sim = U.createSim('midtgang-bakfra', 5, { impatientShare: 0.2 });
  sim.run();
  const lastAisleOut = Math.max(...sim.agents.filter((a) => a.group === 'aisle').map((a) => a.exitT));
  assert.ok(sim.agents.some((a) => a.group !== 'aisle' && a.impatient && a.enterT < lastAisleOut));
});

test('de som har kofferten bak seg går bakover og henter den', () => {
  const sim = U.createSim('fritt', 4, { otherRowShare: 0.5 });
  const backers = sim.agents.filter((a) => a.bagRow > a.row);
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
