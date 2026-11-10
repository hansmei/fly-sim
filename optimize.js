// Leter etter den raskeste regelen for utstigning gjennom fremre dør.
//
// 1. Nedre grense: døra og plassen foran den rommer én person om gangen, så ingen regel
//    kan bli raskere enn summen av hver passasjers tid fra byssa og ut.
// 2. Grovsøk: et par hundre regler (grupper, når neste gruppe slippes, om de som venter
//    gjør seg klare, og om de fletter inn), 30 flyginger hver.
// 3. Finsøk: de beste kjøres 200 ganger.
// 4. Robusthet: de beste kjøres med annen passasjeratferd.
//
// Bruk: node optimize.js   (skriver optimum.js, som nettsiden leser)
'use strict';
const fs = require('fs');
const path = require('path');
const U = require('./sim.js');

const COARSE = 30, FINE = 200, ROBUST = 40, TOP = 12;

// ---------- 1. Nedre grense ----------
function lowerBound(seed) {
  const sim = U.createSim('fritt', seed);
  return sim.agents.reduce((sum, a) => sum + a.walkT + U.PARAMS.doorTime, 0);
}
const lbs = [];
for (let sd = 1; sd <= FINE; sd++) lbs.push(lowerBound(sd));
lbs.sort((a, b) => a - b);
const lb = lbs[Math.floor(lbs.length / 2)];
console.log(`Nedre grense (døra går hele tiden): median ${(lb / 60).toFixed(2)} min`);

// ---------- 2. Regler å prøve ----------
const blocks = (letters, size, backFirst) => {
  const out = [];
  for (let lo = 1; lo <= 30; lo += size) out.push(`${letters}@${lo}-${Math.min(30, lo + size - 1)}`);
  return backFirst ? out.reverse() : out;
};
const ORDERS = {
  'Tre bølger: midtgang, midt, vindu': ['CD', 'BE', 'AF'],
  'Tre bølger: vindu, midt, midtgang': ['AF', 'BE', 'CD'],
  'Seks kolonner, én side om gangen': ['C', 'D', 'B', 'E', 'A', 'F'],
  'Venstre side, så høyre side': ['ABC', 'DEF'],
  'Bølger, bakre halvdel først': ['CD@16-30', 'CD@1-15', 'BE@16-30', 'BE@1-15', 'AF@16-30', 'AF@1-15'],
  'Bølger, fremre halvdel først': ['CD@1-15', 'CD@16-30', 'BE@1-15', 'BE@16-30', 'AF@1-15', 'AF@16-30'],
  'Bølger, oddetallsrader først': ['CD@odd', 'CD@even', 'BE@odd', 'BE@even', 'AF@odd', 'AF@even'],
  'Bakre halvdel, så fremre': ['ABCDEF@16-30', 'ABCDEF@1-15'],
  'Fremre halvdel, så bakre': ['ABCDEF@1-15', 'ABCDEF@16-30'],
  'Blokker på 5 rader bakfra': blocks('ABCDEF', 5, true),
  'Blokker på 5 rader forfra': blocks('ABCDEF', 5, false),
  'Blokker på 10 rader forfra': blocks('ABCDEF', 10, false),
  'Oddetallsrader, så partall': ['ABCDEF@odd', 'ABCDEF@even'],
  'Alle samtidig': ['ABCDEF'],
};
const TRIGGERS = [1, 0.75, 0.5, 'entered'];
const STYLES = [
  { prep: false, merge: 0, label: 'sitter til sin tur' },
  { prep: true, merge: 0, label: 'gjør seg klare' },
  { prep: true, merge: 0, freeGo: true, label: 'gjør seg klare, går når gangen er ledig' },
  { prep: true, merge: 1, freeGo: true, label: 'fletter inn, 1 tom plass bak' },
  { prep: true, merge: 2, freeGo: true, label: 'fletter inn, 2 tomme plasser bak' },
  { prep: true, merge: 3, freeGo: true, label: 'fletter inn, 3 tomme plasser bak' },
];
const trigText = (t) => (t === 'entered' ? 'neste gruppe når forrige har forlatt setene' : t === 1 ? 'neste gruppe når forrige er ute' : `neste gruppe når ${t * 100} % av forrige er ute`);

const FORSLAG = 'Ditt forslag: tre bølger med innfletting';
const VANLIG = 'Vanlig praksis: alle går når de kan';
const RAD = 'Høflig rad for rad';
const candidates = [
  { name: RAD, policy: { kind: 'rad', freeGo: true } },
  { name: VANLIG, policy: { kind: 'fritt' } },
];
for (const [oName, groups] of Object.entries(ORDERS)) {
  for (const trig of groups.length > 1 ? TRIGGERS : [1]) {
    for (const st of STYLES) {
      if (groups.length === 1 && st.merge > 0) continue;
      const isForslag = oName === 'Tre bølger: midtgang, midt, vindu' && trig === 1 && st.merge === U.PARAMS.mergeGap;
      candidates.push({
        name: isForslag ? FORSLAG : `${oName}; ${groups.length > 1 ? trigText(trig) + '; ' : ''}${st.label}`,
        order: oName, trigger: trig, style: st.label,
        policy: { groups, trigger: trig, prep: st.prep, merge: st.merge, freeGo: !!st.freeGo },
      });
    }
  }
}

function evaluate(policy, runs, overrides) {
  const times = [];
  for (let sd = 1; sd <= runs; sd++) times.push(U.createSim(policy, sd, overrides).run());
  return U.stats('x', times);
}

console.log(`Grovsøk: ${candidates.length} regler × ${COARSE} flyginger …`);
const t0 = Date.now();
for (const c of candidates) c.coarse = evaluate(c.policy, COARSE).median;
candidates.sort((a, b) => a.coarse - b.coarse);
console.log(`  ferdig på ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// ---------- 3. Finsøk ----------
const fine = candidates.slice(0, TOP);
for (const ref of [RAD, VANLIG, FORSLAG]) if (!fine.some((c) => c.name === ref)) fine.push(candidates.find((c) => c.name === ref));
for (const c of fine) c.fine = evaluate(c.policy, FINE);
fine.sort((a, b) => a.fine.median - b.fine.median);
console.log(`\nFinsøk, ${FINE} flyginger:`);
for (const c of fine) console.log(`  ${(c.fine.median / 60).toFixed(2)} min  (p10 ${(c.fine.p10 / 60).toFixed(2)}–p90 ${(c.fine.p90 / 60).toFixed(2)})  ${c.name}`);

// ---------- 4. Robusthet ----------
const VARIANTS = [
  { name: 'Standard', ov: {} },
  { name: 'Halvparten klare ved landing', ov: { preReadyShare: 0.5 } },
  { name: 'Få tar ned bagasjen fra setet (30 %)', ov: { seatBagShare: 0.3 } },
  { name: 'Mange kofferter i annen rad (50 %)', ov: { otherRowShare: 0.5 } },
  { name: 'Mange trege (25 %)', ov: { slowShare: 0.25 } },
  { name: 'Mange utålmodige (25 %)', ov: { impatientShare: 0.25 } },
  { name: 'Business i rad 1–4 går først', ov: { businessRows: 4, businessFirst: true } },
];
const robustSet = fine.slice(0, 5);
for (const ref of [FORSLAG, VANLIG]) if (!robustSet.some((c) => c.name === ref)) robustSet.push(fine.find((c) => c.name === ref));
console.log(`\nRobusthet, ${ROBUST} flyginger per variant (median, min):`);
for (const c of robustSet) {
  c.robust = VARIANTS.map((v) => ({ variant: v.name, median: evaluate(c.policy, ROBUST, v.ov).median }));
  console.log(`  ${c.name}\n    ` + c.robust.map((x) => `${x.variant}: ${(x.median / 60).toFixed(2)}`).join(' | '));
}

// ---------- 5. Hva skiller oss fra grensen? ----------
// Samme regel, men passasjerene håndterer bagasjen bedre og bedre.
const BEHAVIOR = [
  { name: 'Slik folk gjør i dag (standard)', ov: {} },
  { name: 'Alle tar ned bagasjen ved setet mens de venter', ov: { seatBagShare: 1 } },
  { name: '… og alle har bagasjen over egen rad', ov: { seatBagShare: 1, otherRowShare: 0 } },
  { name: '… og ingen er trege', ov: { seatBagShare: 1, otherRowShare: 0, slowShare: 0 } },
];
const forslagC = fine.find((c) => c.name === FORSLAG), vanligC = fine.find((c) => c.name === VANLIG);
console.log(`\nBagasjeatferd, ${ROBUST * 2} flyginger (forslag / vanlig praksis):`);
const behavior = BEHAVIOR.map((b) => {
  const f = evaluate(forslagC.policy, ROBUST * 2, b.ov).median, v = evaluate(vanligC.policy, ROBUST * 2, b.ov).median;
  console.log(`  ${b.name.padEnd(50)} ${(f / 60).toFixed(2)} / ${(v / 60).toFixed(2)}`);
  return { name: b.name, forslag: f, vanlig: v };
});

const pick = (c) => ({ name: c.name, order: c.order, trigger: c.trigger, style: c.style, policy: c.policy, fine: c.fine, robust: c.robust });
const payload = {
  generated: new Date().toISOString().slice(0, 10),
  lowerBound: lb, tested: candidates.length, coarseRuns: COARSE, fineRuns: FINE, robustRuns: ROBUST,
  variants: VARIANTS.map((v) => v.name),
  fine: fine.map(pick), robust: robustSet.map(pick), behavior,
};
fs.writeFileSync(path.join(__dirname, 'optimum.js'), '// Generert av optimize.js. Ikke rediger for hånd.\nwindow.UTSTIGNING_OPTIMUM = ' + JSON.stringify(payload, null, 2) + ';\n');
console.log('\nSkrev optimum.js');
