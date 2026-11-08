# Utstigning fra Boeing 737

Simulering av hvor fort 180 passasjerer kommer seg ut av en full Boeing 737-800
når bare fremre venstre dør (1L) er åpen. Seks måter å be folk gå ut på
sammenlignes, og hver kjøres 200 ganger med ulike passasjerer og ulik bagasje.

Alle scenariene starter likt: når døra åpnes, står 70 % av dem på
midtgangssetene klare med bagasjen. Én per rad står i midtgangen, den andre ved
setet sitt.

| Scenario | Regel |
|---|---|
| Vanlig praksis: alle går når de kan | Slik det går for seg i dag. Alle går ut i midtgangen så snart det er ledig ved raden deres. |
| Høflig rad for rad | Slik det ville gått om alle var høflige. Neste rad reiser seg når raden foran begynner å gå. |
| Tre bølger, alle sitter til sin tur | Midtgangsseter, så midtseter, så vindusseter. Hver bølge venter sittende til forrige er ute, og går så ut i gangen og tar ned bagasjen samtidig. |
| Tre bølger, gjør seg klare imens | Som over, men de som venter, flytter seg inn på det ledige setet mot midtgangen og tar ned bagasjen der. |
| Seks bølger, bakre halvdel først | Den beste regelen `optimize.js` fant. Som forslaget, men hver bølge deles i rad 16–30 og så rad 1–15, og neste bølge slippes når 75 % av forrige er ute. |
| Tre bølger med innfletting (forslaget) | Som over, og de som er klare, går før tur når det er klar bane: plassen rett bak dem i midtgangen er tom. |

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
usikre. Forslaget med innfletting var raskest i alle
variantene vi prøvde, med 8–9 minutter mot rundt 12 for vanlig praksis, der alle går når de kan.

## Den beste regelen

`optimize.js` tester 264 regler. Ingen regel kan slå 5,3 minutter, fordi døra
rommer én person om gangen. De beste reglene, også forslaget, havner på et
platå rundt 8 minutter. Forskjellen mellom dem er mindre enn variasjonen fra fly
til fly. Resten av avstanden til grensen skyldes bagasjen: tar alle ned
bagasjen ved setet, har den over egen rad og ingen er trege, tar forslaget 5,7
minutter.

## Hva det er verdt i året

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
