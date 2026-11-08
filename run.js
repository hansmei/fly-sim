// Kjører alle scenarier mange ganger og skriver resultatene til results.js,
// som nettsiden leser. Bruk: node run.js [antall flyginger per scenario]
'use strict';
const fs = require('fs');
const path = require('path');
const U = require('./sim.js');

const runs = Number(process.argv[2]) || 200;
const results = U.SCENARIOS.map((s) => {
  const r = U.summarize(s.id, runs, 1);
  console.log(`${s.name.padEnd(48)} median ${(r.median / 60).toFixed(1)} min  (p10 ${(r.p10 / 60).toFixed(1)} – p90 ${(r.p90 / 60).toFixed(1)})`);
  return r;
});

const payload = { generated: new Date().toISOString().slice(0, 10), runs, params: U.PARAMS, results };
fs.writeFileSync(
  path.join(__dirname, 'results.js'),
  '// Generert av run.js. Ikke rediger for hånd.\nwindow.UTSTIGNING_RESULTS = ' + JSON.stringify(payload, null, 2) + ';\n'
);
console.log(`Skrev results.js (${runs} flyginger per scenario).`);
