# Utstigning fra Boeing 737

Simulering av hvor fort 180 passasjerer kommer seg ut av en full Boeing 737-800
når bare fremre venstre dør (1L) er åpen. Seks måter å be folk gå ut på
sammenlignes, og hver kjøres 200 ganger med ulike passasjerer og ulik bagasje.

| Scenario | Regel |
|---|---|
| Rad for rad forfra | Vanlig praksis. Neste rad reiser seg når raden foran begynner å gå. |
| Fritt fram | Alle går ut i midtgangen så snart det er ledig ved raden deres. |
| Midtgangsseter først, så resten bakfra | Midtgangssetene (C, D) går ut. Midt- og vindusseter venter til den siste av dem er ute av flyet, og tømmes så rad for rad bakfra. |
| Midtgangsseter først, så resten forfra | Som over, men fase 2 går forfra. |
| Midtgangsseter først, resten bakfra uten pause | Fase 2 starter når midtgangssetene har kommet ut i midtgangen, ikke når de er ute av flyet. |
| Tre bølger | Midtgangsseter, så midtseter, så vindusseter. Hver bølge går fritt og venter til forrige bølge er ute. |

## Kjøre

Krever Node 18 eller nyere. Ingen avhengigheter.

```bash
npm test       # tester modellen
npm run sim    # kjører 200 flyginger per scenario og skriver results.js
```

Åpne `index.html` i nettleseren for resultatene og animasjonen. Den leser
`sim.js` og `results.js` fra samme mappe.

## Filer

- `sim.js`: modellen. Fungerer både i Node og i nettleseren.
- `run.js`: kjører alle scenariene og skriver `results.js`.
- `index.html`: resultater og animasjon av kabinen, laget for telefon.
- `test.js`: tester at alle kommer ut, at reglene følges og at midtgangen aldri har to personer på samme plass.

## Modellen

Midtgangen er delt i én plass per rad pluss byssa ved døra, med plass til én
person per plass. Passasjerene reiser seg, flytter seg sidelengs mot midtgangen,
henter bagasjen stående i midtgangen og går mot døra. Den som står ved
midtgangssetet og venter, kan begynne å ta ned bagasjen, men saktere. Alle
tidene står i `PARAMS` øverst i `sim.js`.

Tallene er anslag og ikke målt i et ekte fly, så de absolutte tidene er
usikre. Rekkefølgen mellom scenariene holder seg når bagasjeandel,
bagasjetid, fart gjennom døra og hvor ofte folk slipper andre foran seg endres.
Tre bølger var raskest i alle variantene.
