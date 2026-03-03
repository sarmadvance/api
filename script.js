// Globale variabelen
let allCountries = [];           // Alle landen van de API
let filteredCountries = [];      // Gefilterde (en gesorteerde) landen voor weergave
let currentSortOrder = 'asc';    // 'asc' = oplopend, 'desc' = aflopend (bevolking)

// DOM-elementen
const searchInput = document.getElementById('search');
const regionFilter = document.getElementById('region-filter');
const sortButton = document.getElementById('sort-population');
const countriesGrid = document.getElementById('countries-grid');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Laad alle landen bij het starten
window.addEventListener('load', fetchAllCountries);

// Event listeners voor interactie
searchInput.addEventListener('input', applyFilters);
regionFilter.addEventListener('change', applyFilters);
sortButton.addEventListener('click', toggleSort);

/**
 * Haalt alle landen op van de REST Countries API
 * Gebruik van 'fields' parameter om alleen de benodigde data op te halen
 */
async function fetchAllCountries() {
    showLoading(true);
    hideError();

    try {
        // Let op: de URL bevat nu een 'fields' query om het aantal velden te beperken
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LandenApp/1.0)'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP-fout! Status: ${response.status} - ${errorText || 'Geen details'}`);
        }

        allCountries = await response.json();

        // Vul de regioselectie met unieke regio's
        populateRegionFilter(allCountries);

        // Toon alle landen (standaard weergave)
        filteredCountries = [...allCountries];
        renderCountries(filteredCountries);
    } catch (error) {
        showError(`Fout bij ophalen van landen: ${error.message}`);
        console.error(error);
    } finally {
        showLoading(false);
    }
}

/**
 * Vult de dropdown met unieke regio's uit de landenlijst
 */
function populateRegionFilter(countries) {
    // Maak de regio-dropdown leeg voordat we nieuwe opties toevoegen
    regionFilter.innerHTML = '<option value="">Alle regio\'s</option>';

    // Verzamel alle regio's, filter lege/null en maak uniek
    const regions = [...new Set(countries.map(c => c.region).filter(r => r))].sort();

    // Voeg een optie toe voor elke regio
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });
}

/**
 * Past zoek- en filtercriteria toe en toont de resultaten
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRegion = regionFilter.value;

    // Eerst filteren op regio (als geselecteerd)
    let filtered = allCountries.filter(country => {
        if (selectedRegion && country.region !== selectedRegion) return false;
        return true;
    });

    // Vervolgens filteren op zoekterm (landnaam)
    if (searchTerm !== '') {
        filtered = filtered.filter(country =>
            country.name.common.toLowerCase().includes(searchTerm)
        );
    }

    // Sorteer de gefilterde lijst op bevolking (huidige sorteervolgorde)
    sortCountries(filtered, currentSortOrder);

    // Werk de weergave bij
    filteredCountries = filtered;
    renderCountries(filteredCountries);
}

/**
 * Sorteert de landen op bevolking (oplopend of aflopend)
 */
function sortCountries(countries, order) {
    countries.sort((a, b) => {
        const popA = a.population || 0;
        const popB = b.population || 0;
        return order === 'asc' ? popA - popB : popB - popA;
    });
}

/**
 * Wisselt de sorteervolgorde om en werkt de weergave bij
 */
function toggleSort() {
    // Wijzig sorteervolgorde
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';

    // Pas het knoplabel aan
    sortButton.textContent = currentSortOrder === 'asc'
        ? 'Sorteer op bevolking ⬇️'
        : 'Sorteer op bevolking ⬆️';

    // Pas sortering toe op de huidige gefilterde lijst en render opnieuw
    sortCountries(filteredCountries, currentSortOrder);
    renderCountries(filteredCountries);
}

/**
 * Toont de landen in het grid (HTML genereren)
 */
function renderCountries(countries) {
    if (countries.length === 0) {
        countriesGrid.innerHTML = '<p class="no-results">Geen landen gevonden.</p>';
        return;
    }

    // Bouw HTML voor alle kaarten
    const html = countries.map(country => {
        // Veilige uitlezing van eigenschappen
        const name = country.name?.common || 'Onbekend';
        const capital = country.capital?.[0] || 'N/A';
        const population = country.population ? country.population.toLocaleString('nl-NL') : 'Onbekend';
        const region = country.region || 'Onbekend';
        const flag = country.flags?.png || country.flags?.svg || 'https://via.placeholder.com/300x200?text=Geen+vlag';

        return `
            <div class="country-card">
                <img class="country-flag" src="${flag}" alt="Vlag van ${name}" loading="lazy">
                <div class="country-info">
                    <h2>${name}</h2>
                    <p><strong>Hoofdstad:</strong> ${capital}</p>
                    <p><strong>Bevolking:</strong> ${population}</p>
                    <p><strong>Regio:</strong> ${region}</p>
                </div>
            </div>
        `;
    }).join('');

    countriesGrid.innerHTML = html;
}

/**
 * Toont of verbergt de laadindicator
 */
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    if (show) countriesGrid.innerHTML = ''; // Maak grid leeg tijdens laden
}

/**
 * Toont een foutmelding
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    countriesGrid.innerHTML = ''; // Verberg eventuele oude resultaten
}

/**
 * Verbergt de foutmelding
 */
function hideError() {
    errorDiv.style.display = 'none';
}