# Landen Informatie App

Dit is een eenvoudige webapplicatie die gegevens van landen toont met behulp van de [REST Countries API](https://restcountries.com/).

## Functionaliteiten

- ✅ **Alle landen ophalen** en tonen in een overzichtelijk grid.
- 🔍 **Zoeken** op landnaam (via de zoekbalk).
- 🌍 **Filteren op regio** (Europa, Azië, Afrika, etc.).
- 📊 **Sorteren op bevolking** (oplopend/aflopend via een knop).
- ⏳ **Laadindicator** terwijl data wordt opgehaald.
- ❌ **Foutafhandeling** bij netwerkproblemen of ongeldige responses.
- 📱 **Responsive design** – werkt op desktop, tablet en mobiel.

## Gebruikte API

- **Endpoint**: `https://restcountries.com/v3.1/all`
- **Documentatie**: [https://restcountries.com/](https://restcountries.com/)

De app haalt een lijst van alle landen op en toont per land:
- Vlag (afbeelding)
- Officiële naam
- Hoofdstad
- Bevolkingsaantal
- Regio

## Installatie / Gebruik

1. Clone deze repository of download de bestanden.
2. Open `index.html` in een moderne webbrowser.
3. Gebruik de zoekbalk, filter en sorteerbutton om de landenlijst aan te passen.

Er is geen server of build-stap nodig – alles draait in de browser.

## Samenwerking (GitHub)

- Beide teamleden hebben meerdere commits gedaan.
- Er is gebruikgemaakt van branches (bijv. `feature/search`, `feature/filter`, `feature/readme`).
- Pull requests zijn gebruikt om wijzigingen te mergen naar `main`.
- Dit README-bestand is samen geschreven.

## Verbeterpunten / Extra's (tijd over)

- [ ] Donkere modus toevoegen.
- [ ] Landen kunnen vergelijken (twee selecteren).
- [ ] Favorieten opslaan in localStorage.
- [ ] Meer sorteeropties (bijv. alfabetisch, oppervlakte).

## Credits

Gemaakt door [Jouw Naam] en [Teamgenoot] voor de opdracht "Werken met API en JSON".