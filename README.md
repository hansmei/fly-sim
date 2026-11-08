# Utstigning fra Boeing 737

Simulering av hvor fort 180 passasjerer kommer seg ut av en full Boeing 737-800
når bare fremre venstre dør (1L) er åpen. Fem måter å be folk gå ut på
sammenlignes, og hver kjøres 200 ganger med ulike passasjerer og ulik bagasje.

Alle scenariene starter likt: når døra åpnes, står 70 % av dem på
midtgangssetene klare med bagasjen. Én per rad står i midtgangen, den andre ved
setet sitt.

| Scenario | Regel |
|---|---|
| Rad for rad forfra | Vanlig praksis. Neste rad reiser seg når raden foran begynner å gå. |
| Fritt fram | Alle går ut i midtgangen så snart det er ledig ved raden deres. |
| Tre bølger, alle sitter til sin tur | Midtgangsseter, så midtseter, så vindusseter. Hver bølge venter sittende til forrige er ute, og går så ut i gangen og tar ned bagasjen samtidig. |
| Tre bølger, gjør seg klare imens | Som over, men de som venter, flytter seg inn på det ledige setet mot midtgangen og tar ned bagasjen der. |
| Tre bølger med innfletting (forslaget) | Som over, og de som er klare, går før tur når det er klar bane: de to plassene bak dem i midtgangen er tomme. |

Hvert scenario kjøres i tre kabiner:

- **Bare økonomi:** 180 passasjerer.
- **Business i rad 1–4:** midtsetet står tomt, så det er 172 passasjerer. Business følger samme regler som resten.
- **Business i rad 1–4 går først:** forhenget bak rad 4 holder økonomi tilbake til siste businesspassasjer er ute. Økonomi kan imens reise seg og ta ned bagasjen bak forhenget.

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
midtgangssetet og venter, kan begynne å ta ned bagasjen, men saktere. Hver passasjer har sitt eget tempo, og noen er trege. Noen har kofferten en rad
foran eller en til to rader bak, og må gå mot strømmen og presse seg forbi folk
for å hente den. Noen er utålmodige og bryter rekkefølgen. Alle tidene og
andelene står i `PARAMS` øverst i `sim.js`.

Tallene er anslag og ikke målt i et ekte fly, så de absolutte tidene er
usikre. Forslaget med innfletting var raskest i alle
variantene vi prøvde, med 8–9 minutter mot rundt 13 for vanlig praksis.
