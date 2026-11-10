// Kjører alle scenarier mange ganger og skriver resultatene til results.js,
// som nettsiden leser. Bruk: node run.js [antall flyginger per scenario]
'use strict';
const fs = require('fs');
const path = require('path');
const U = require('./sim.js');

const runs = Number(process.argv[2]) || 200;

// Tre kabiner: bare økonomi, business i rad 1–4 uten fortrinn, og business som går først.
const CABINS = [
  { id: 'okonomi', name: 'Bare økonomi', overrides: {} },
  { id: 'business', name: 'Business i rad 1–4', overrides: { businessRows: 4 } },
  { id: 'business-forst', name: 'Business i rad 1–4 går først', overrides: { businessRows: 4, businessFirst: true } },
];

const cabins = {};
for (const c of CABINS) {
  console.log(`\n${c.name}`);
  cabins[c.id] = U.SCENARIOS.map((s) => {
    const r = U.summarize(s.id, runs, 1, c.overrides);
    console.log(`  ${s.name.padEnd(46)} median ${(r.median / 60).toFixed(1)} min  (p10 ${(r.p10 / 60).toFixed(1)} – p90 ${(r.p90 / 60).toFixed(1)})`);
    return r;
  });
}

// Sammendrag: vanlig praksis mot ditt forslag ved ulik kabinfaktor, og nedre grense.
// Brukes til sammendraget og årsberegningen på nettsiden.
const SUMMARY_RUNS = runs;
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; };
const summary = [0.7, 0.75, 0.8, 0.86, 0.9, 1].map((lf) => {
  const row = { loadFactor: lf };
  for (const id of ['fritt', 'forslag']) {
    const total = [], perPax = [];
    for (let sd = 1; sd <= SUMMARY_RUNS; sd++) {
      const sim = U.createSim(id, sd, { loadFactor: lf });
      sim.run();
      total.push(sim.t);
      perPax.push(sim.agents.reduce((s, a) => s + a.exitT, 0) / sim.total);
    }
    row[id] = { median: median(total), paxMean: median(perPax) };
  }
  const lb = [], pax = [];
  for (let sd = 1; sd <= SUMMARY_RUNS; sd++) {
    const sim = U.createSim('fritt', sd, { loadFactor: lf });
    lb.push(sim.agents.reduce((s, a) => s + a.walkT + U.PARAMS.doorTime, 0));
    pax.push(sim.total);
  }
  row.lowerBound = median(lb); row.passengers = median(pax);
  console.log(`Kabinfaktor ${lf}: vanlig ${(row.fritt.median / 60).toFixed(2)}, forslag ${(row.forslag.median / 60).toFixed(2)}, grense ${(row.lowerBound / 60).toFixed(2)} min`);
  return row;
});

// Bakre dør åpnes etter 1, 2 og 3 minutter, for alle scenarier (bare økonomi).
const REAR = [60, 120, 180];
const rear = {};
for (const at of REAR) {
  console.log(`\nBakre dør åpnes etter ${at / 60} min`);
  rear[at] = U.SCENARIOS.map((s) => {
    const times = [], rearShare = [];
    for (let sd = 1; sd <= runs; sd++) {
      const sim = U.createSim(s.id, sd, { rearDoorAt: at });
      sim.run();
      times.push(sim.t);
      rearShare.push(sim.outRear / sim.total);
    }
    const st = U.stats(s.id, times);
    st.rearShare = median(rearShare);
    console.log(`  ${s.name.padEnd(46)} median ${(st.median / 60).toFixed(1)} min  (p10 ${(st.p10 / 60).toFixed(1)} – p90 ${(st.p90 / 60).toFixed(1)}), ${Math.round(st.rearShare * 100)} % ut bak`);
    return st;
  });
}

const payload = { summary, rear, generated: new Date().toISOString().slice(0, 10), runs, params: U.PARAMS, cabins: CABINS, results: cabins };
fs.writeFileSync(
  path.join(__dirname, 'results.js'),
  '// Generert av run.js. Ikke rediger for hånd.\nwindow.UTSTIGNING_RESULTS = ' + JSON.stringify(payload, null, 2) + ';\n'
);
console.log(`\nSkrev results.js (${runs} flyginger per scenario og kabin).`);
