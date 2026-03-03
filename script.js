// Globale variabelen
let allMovies = [];               // Alle films van de API
let filteredMovies = [];          // Gefilterde films voor weergave
let currentSortOrder = 'asc';     // 'asc' = oplopend (oud naar nieuw), 'desc' = aflopend

// DOM-elementen
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genre-filter');
const sortButton = document.getElementById('sort-year');
const moviesGrid = document.getElementById('movies-grid');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Vervang dit met je eigen OMDb API-sleutel
const API_KEY = '29685db1';  // <-- Vul hier je sleutel in

// Laad Marvel-films bij het starten
window.addEventListener('load', fetchMarvelMovies);

// Event listeners voor interactie
searchInput.addEventListener('input', applyFilters);
genreFilter.addEventListener('change', applyFilters);
sortButton.addEventListener('click', toggleSort);

/**
 * Haalt alle Marvel-films op via OMDb API
 */
async function fetchMarvelMovies() {
    showLoading(true);
    hideError();

    try {
        // Eerst zoeken we naar alle films met "Marvel" in de titel
        const searchResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=Marvel&type=movie`);
        
        if (!searchResponse.ok) {
            throw new Error(`HTTP-fout! Status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.Response === 'False') {
            throw new Error(searchData.Error || 'Geen films gevonden');
        }

        // searchData.Search bevat een lijst van films met basisgegevens (titel, jaar, imdbID, poster)
        const basicMovies = searchData.Search || [];

        // Voor elke film halen we gedetailleerde info op via de imdbID
        const detailPromises = basicMovies.map(async (movie) => {
            const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`);
            const detailData = await detailResponse.json();
            return detailData;
        });

        allMovies = await Promise.all(detailPromises);

        // Filter alleen films die echt Marvel zijn (soms komen er valse positieven)
        allMovies = allMovies.filter(movie => 
            movie.Title && movie.Title.toLowerCase().includes('marvel') || 
            (movie.Genre && movie.Genre.includes('Marvel'))
        );

        // Vul de genre-filter met unieke genres
        populateGenreFilter(allMovies);

        // Toon alle films
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
        if (movie.Genre) {
            return movie.Genre.split(',').map(g => g.trim());
        }
        return [];
    });

    // Unieke genres en sorteren
    const uniqueGenres = [...new Set(allGenres)].sort();

    // Reset de dropdown
    genreFilter.innerHTML = '<option value="">Alle genres</option>';

    // Voeg opties toe
    uniqueGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

/**
 * Past zoek- en filtercriteria toe
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;

    // Filter op genre
    let filtered = allMovies.filter(movie => {
        if (selectedGenre) {
            const movieGenres = movie.Genre ? movie.Genre.split(',').map(g => g.trim()) : [];
            return movieGenres.includes(selectedGenre);
        }
        return true;
    });

    // Filter op zoekterm (titel)
    if (searchTerm !== '') {
        filtered = filtered.filter(movie =>
            movie.Title.toLowerCase().includes(searchTerm)
        );
    }

    // Sorteer op jaar
    sortMovies(filtered, currentSortOrder);

    filteredMovies = filtered;
    renderMovies(filteredMovies);
}

/**
 * Sorteert films op jaar (oplopend/aflopend)
 */
function sortMovies(movies, order) {
    movies.sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return order === 'asc' ? yearA - yearB : yearB - yearA;
    });
}

/**
 * Wisselt sorteervolgorde
 */
function toggleSort() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    sortButton.textContent = currentSortOrder === 'asc'
        ? 'Sorteer op jaar ⬇️'
        : 'Sorteer op jaar ⬆️';
    sortMovies(filteredMovies, currentSortOrder);
    renderMovies(filteredMovies);
}

/**
 * Toont films in het grid
 */
function renderMovies(movies) {
    if (movies.length === 0) {
        moviesGrid.innerHTML = '<p class="no-results">Geen films gevonden.</p>';
        return;
    }

    const html = movies.map(movie => {
        const title = movie.Title || 'Onbekende titel';
        const year = movie.Year || 'Onbekend';
        const director = movie.Director || 'Onbekend';
        const actors = movie.Actors || 'Onbekend';
        const genre = movie.Genre || 'Onbekend';
        const plot = movie.Plot ? (movie.Plot.length > 100 ? movie.Plot.substring(0, 100) + '...' : movie.Plot) : 'Geen beschrijving.';
        const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Geen+poster';

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

function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    if (show) moviesGrid.innerHTML = '';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    moviesGrid.innerHTML = '';
}

function hideError() {
    errorDiv.style.display = 'none';
}