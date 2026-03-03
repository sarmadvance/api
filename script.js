// Globale variabelen
let allMovies = [];               // Alle films van de API
let filteredMovies = [];          // Gefilterde (en gesorteerde) films voor weergave
let currentSortOrder = 'asc';     // 'asc' = oplopend (oud naar nieuw), 'desc' = aflopend

// DOM-elementen
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genre-filter');
const sortButton = document.getElementById('sort-year');
const moviesGrid = document.getElementById('movies-grid');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Laad alle films bij het starten
window.addEventListener('load', fetchAllMovies);

// Event listeners voor interactie
searchInput.addEventListener('input', applyFilters);
genreFilter.addEventListener('change', applyFilters);
sortButton.addEventListener('click', toggleSort);

/**
 * Haalt alle films op van de Marvel Film API
 */
async function fetchAllMovies() {
    showLoading(true);
    hideError();

    try {
        const response = await fetch('https://marvel-film-api.fly.dev/api/movies?limit=50', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MarvelApp/1.0)'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP-fout! Status: ${response.status} - ${errorText || 'Geen details'}`);
        }

        // De API retourneert een array van films
        const data = await response.json();
        allMovies = data;  // data is direct de array

        // Vul de genre-filter met unieke genres
        populateGenreFilter(allMovies);

        // Toon alle films (standaard weergave)
        filteredMovies = [...allMovies];
        renderMovies(filteredMovies);
    } catch (error) {
        showError(`Fout bij ophalen van films: ${error.message}`);
        console.error(error);
    } finally {
        showLoading(false);
    }
}

/**
 * Vult de dropdown met unieke genres uit de filmlijst
 */
function populateGenreFilter(movies) {
    // Verzamel alle genres (splits bij komma en trim spaties)
    const allGenres = movies.flatMap(movie => {
        if (movie.genre) {
            return movie.genre.split(',').map(g => g.trim());
        }
        return [];
    });

    // Unieke genres en sorteren
    const uniqueGenres = [...new Set(allGenres)].sort();

    // Reset de dropdown (behoud de eerste 'Alle genres' optie)
    genreFilter.innerHTML = '<option value="">Alle genres</option>';

    // Voeg een optie toe voor elk uniek genre
    uniqueGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

/**
 * Past zoek- en filtercriteria toe en toont de resultaten
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;

    // Eerst filteren op genre (als geselecteerd)
    let filtered = allMovies.filter(movie => {
        if (selectedGenre) {
            // Controleer of het geselecteerde genre voorkomt in de genre-string van de film
            const movieGenres = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];
            return movieGenres.includes(selectedGenre);
        }
        return true;
    });

    // Vervolgens filteren op zoekterm (titel)
    if (searchTerm !== '') {
        filtered = filtered.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm)
        );
    }

    // Sorteer de gefilterde lijst op jaar (huidige sorteervolgorde)
    sortMovies(filtered, currentSortOrder);

    // Werk de weergave bij
    filteredMovies = filtered;
    renderMovies(filteredMovies);
}

/**
 * Sorteert de films op jaar (oplopend of aflopend)
 */
function sortMovies(movies, order) {
    movies.sort((a, b) => {
        const yearA = a.year || 0;
        const yearB = b.year || 0;
        return order === 'asc' ? yearA - yearB : yearB - yearA;
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
        ? 'Sorteer op jaar ⬇️'   // ⬇️ = oud naar nieuw (oplopend)
        : 'Sorteer op jaar ⬆️';  // ⬆️ = nieuw naar oud (aflopend)

    // Pas sortering toe op de huidige gefilterde lijst en render opnieuw
    sortMovies(filteredMovies, currentSortOrder);
    renderMovies(filteredMovies);
}

/**
 * Toont de films in het grid (HTML genereren)
 */
function renderMovies(movies) {
    if (movies.length === 0) {
        moviesGrid.innerHTML = '<p class="no-results">Geen films gevonden.</p>';
        return;
    }

    // Bouw HTML voor alle kaarten
    const html = movies.map(movie => {
        // Veilige uitlezing van eigenschappen
        const title = movie.title || 'Onbekende titel';
        const year = movie.year || 'Onbekend';
        const director = movie.director || 'Onbekend';
        const actors = movie.actors || 'Onbekend';
        const genre = movie.genre || 'Onbekend';
        const plot = movie.plot ? (movie.plot.length > 100 ? movie.plot.substring(0, 100) + '...' : movie.plot) : 'Geen beschrijving beschikbaar.';
        const poster = movie.poster || 'https://via.placeholder.com/300x450?text=Geen+poster';

        return `
            <div class="movie-card">
                <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy">
                <div class="movie-info">
                    <h2>${title} (${year})</h2>
                    <p><strong>Regisseur:</strong> ${director}</p>
                    <p><strong>Acteurs:</strong> ${actors}</p>
                    <p><strong>Genre:</strong> ${genre}</p>
                    <p class="plot">${plot}</p>
                </div>
            </div>
        `;
    }).join('');

    moviesGrid.innerHTML = html;
}

/**
 * Toont of verbergt de laadindicator
 */
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    if (show) moviesGrid.innerHTML = ''; // Maak grid leeg tijdens laden
}

/**
 * Toont een foutmelding
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    moviesGrid.innerHTML = ''; // Verberg eventuele oude resultaten
}

/**
 * Verbergt de foutmelding
 */
function hideError() {
    errorDiv.style.display = 'none';
}