# fly-sim: utstigning fra Boeing 737

Hvor fort kommer passasjerene ut av en Boeing 737-800 når bare fremre dør er
åpen, og hvordan bør kabinpersonalet be dem gå ut?

**Se resultatene og animasjonen:** https://claude.ai/artifact/UCkG7ftLmrkHt255zheNnC
Siden er privat til den deles fra Del-menyen øverst på den.

## Sammendrag

| | Fullt fly (180) | 86 % fullt |
|---|---|---|
| Vanlig praksis: alle går når de kan | 12:10 | 10:19 |
| **Beste løsning: tre bølger med innfletting** | **8:01** | **6:58** |
| Teoretisk optimum: døra står aldri ledig | 5:16 | 4:32 |

Medianen av 200 simulerte flyginger per scenario.

- **Beste løsning er rundt en tredel raskere enn vanlig praksis.** Den sparer
  4,1 minutter på et fullt fly og 3,4 minutter ved 86 % kabinfaktor. Den
  gjennomsnittlige passasjeren er ute 2 minutter tidligere.
- **Det finnes ingen enkelt vinner, men et platå.** `optimize.js` testet 264
  regler. De beste ligger alle rundt 8 minutter, med mindre forskjell enn
  variasjonen fra fly til fly. Tre bølger med innfletting er den enkleste av dem
  å forklare for passasjerene.
- **Resten opp til optimum skyldes bagasjen, ikke rekkefølgen.** Tar alle ned
  bagasjen ved setet, har den over egen rad og ingen er trege, tar beste løsning
  5:42. Kortere enn 5:16 går det bare med en dør til.
- **Business først koster rundt et halvt minutt** med beste løsning, men nesten
  ingenting med vanlig praksis.

### Hva som skal til

1. Før døra åpnes, står passasjerene på midtgangssetene klare med bagasjen.
   Rundt 70 % gjør det allerede i dag.
2. Bølge 1: midtgangssetene går. Imens flytter midt- og vinduspassasjerer seg
   inn på det ledige setet og tar ned bagasjen der.
3. Den som er klar, fletter inn når plassen rett bak i midtgangen er tom. Ellers
   venter de.
4. Bølge 2 og 3: midtsetene går ut i gangen samtidig, så vindussetene.

Kabinpersonalet må annonsere bølgene tydelig og holde igjen dem som ikke er
klare. Det bør prøves på noen ruter først. Får passasjerene beskjed ved
ombordstigning om å legge bagasjen over egen rad, faller tiden mot 6 minutter.

### Hva det er verdt i året

| | Norwegian | SAS |
|---|---|---|
| Flyginger der bare fremre dør brukes | ca. 72 500 | ca. 73 700 |
| Spart per slik flyging | 3,4 min | 3,1 min |
| Spart bakketid i snuoperasjoner | ca. 3 500 flytimer | ca. 3 200 flytimer |
| Verdi, regnet som kostnad ved gate | ca. 3,7 mill. € | ca. 3,4 mill. € |
| Verdi, hvis minuttene hindrer forsinkelser | ca. 21 mill. € | ca. 19 mill. € |
| Passasjertid spart | ca. 390 000 timer | ca. 320 000 timer |

Den sanne verdien ligger trolig mellom de to verdiradene. Forutsetningene står
nederst og kan endres på siden.

## Scenariene

Hvert scenario kjøres 200 ganger med ulike passasjerer og ulik bagasje.

Alle scenariene starter likt: når døra åpnes, står 70 % av dem på
midtgangssetene klare med bagasjen. Én per rad står i midtgangen, den andre ved
setet sitt.

| Scenario | Regel |
|---|---|
| Vanlig praksis: alle går når de kan | Slik det går for seg i dag. Alle går ut i midtgangen så snart det er ledig ved raden deres. |
| Høflig rad for rad | Slik det ville gått om alle var høflige. Neste rad reiser seg når raden foran begynner å gå. |
| Tre bølger, alle sitter til sin tur | Midtgangsseter, så midtseter, så vindusseter. Hver bølge venter sittende til forrige er ute, og går så ut i gangen og tar ned bagasjen samtidig. |
| Tre bølger, gjør seg klare imens | Som over, men de som venter, flytter seg inn på det ledige setet mot midtgangen og tar ned bagasjen der. |
| Tre bølger med innfletting (forslaget) | Som over, og de som er klare, går før tur når det er klar bane: plassen rett bak dem i midtgangen er tom. |
| Seks bølger, bakre halvdel først | Den beste regelen `optimize.js` fant. Som forslaget, men hver bølge deles i rad 16–30 og så rad 1–15, og neste bølge slippes når 75 % av forrige er ute. |

Hvert scenario kjøres i tre kabiner:

- **Bare økonomi:** 180 passasjerer.
- **Business i rad 1–4:** midtsetet står tomt, så det er 172 passasjerer. Business følger samme regler som resten.
- **Business i rad 1–4 går først:** forhenget bak rad 4 holder økonomi tilbake til siste businesspassasjer er ute. Økonomi kan imens reise seg og ta ned bagasjen bak forhenget.

## Kjøre

Krever Node 18 eller nyere. Ingen avhengigheter.

```bash
npm test       # tester modellen
npm run sim    # kjører 200 flyginger per scenario og skriver results.js
npm run optimize  # leter etter den raskeste regelen (tar noen minutter)
```

Åpne `index.html` i nettleseren for resultatene og animasjonen. Den leser
`sim.js` og `results.js` fra samme mappe.

## Filer

- `sim.js`: modellen. Fungerer både i Node og i nettleseren.
- `run.js`: kjører alle scenariene og skriver `results.js`.
- `index.html`: resultater og animasjon av kabinen, laget for telefon.
- `optimize.js`: leter etter den raskeste regelen og regner ut den nedre grensen. Skriver `optimum.js`.
- `test.js`: tester at alle kommer ut, at reglene følges og at midtgangen aldri har to personer på samme plass.

## Modellen

Midtgangen er delt i én plass per rad pluss byssa ved døra, med plass til én
person per plass. Passasjerene reiser seg, flytter seg sidelengs mot midtgangen,
henter bagasjen stående i midtgangen og går mot døra. Den som står ved
midtgangssetet og venter, kan begynne å ta ned bagasjen, men saktere. Hver passasjer har sitt eget tempo, og noen er trege. Noen har kofferten en rad
foran eller en til to rader bak, og må gå mot strømmen og presse seg forbi folk
for å hente den. Noen er utålmodige og bryter rekkefølgen. Alle tidene og
andelene står i `PARAMS` øverst i `sim.js`.

Tallene er anslag og ikke målt i et ekte fly, så de absolutte tidene er
usikre. Forslaget med innfletting holdt seg på platået i alle
variantene vi prøvde, med 8–9 minutter mot rundt 12 for vanlig praksis, der alle går når de kan.

## Den beste regelen

`optimize.js` tester 264 regler. Ingen regel kan slå 5,3 minutter, fordi døra
rommer én person om gangen. De beste reglene, også forslaget, havner på et
platå rundt 8 minutter. Forskjellen mellom dem er mindre enn variasjonen fra fly
til fly. Resten av avstanden til grensen skyldes bagasjen: tar alle ned
bagasjen ved setet, har den over egen rad og ingen er trege, tar forslaget 5,7
minutter.

## Forutsetninger for årsverdien

Nettsiden regner ut verdien for Norwegian og SAS. Forutsetningene kan endres på
siden. Standardverdiene er:

| | Norwegian | SAS |
|---|---|---|
| Passasjerer per år | 23,2 mill. (gruppen 27,3 mill. minus Widerøe 4,13 mill., 2025) | 28,3 mill. (regnskapsåret 2025) |
| Andel på fly med rundt 180 seter | 100 % | 75 % (anslag) |
| Seter per fly | 186 | 180 |
| Kabinfaktor | 86 % (4. kvartal 2025) | 80 % (anslag) |

Felles anslag: 50 % av flygingene bruker bare fremre dør, og flyet snur videre
etter 85 % av ankomstene. Spart tid er verdsatt med Eurocontrols standardverdier:
17,78 € per minutt for et fly som står ved gate (2022-priser) og rundt 100 € per
forsinkelsesminutt. Den siste gjelder bare minutter som faktisk hindrer
forsinkelser, så den sanne verdien ligger trolig mellom de to.

Kilder: [Norwegian, resultat 2025](https://www.inderes.fi/releases/nas-norwegian-group-delivers-record-result-for-2025-and-increases-dividend),
[Norwegian, trafikktall desember 2025](https://www.inderes.fi/en/releases/norwegian-air-shuttle-asa-nas-traffic-figures-for-december-2025),
[SAS årsrapport FY25](https://www.sasgroup.net/files/documents/financial-reports/2025/sas-ab-annual-report-fy25.pdf),
[Eurocontrol Standard Inputs](https://ansperformance.eu/economics/cba/standard-inputs/chapters/cost_of_delay.html).
