"use strict"

window.addEventListener("load", initApp);

let allMovies = [];

function initApp() {
  console.log("initApp: app.js is running 🎉");
  getMovies();
  document
    .querySelector("#search-input")
    .addEventListener("input", filterMovies);
  document
    .querySelector("#genre-select")
    .addEventListener("change", filterMovies);
  document
    .querySelector("#sort-select")
    .addEventListener("change", filterMovies);
   document
    .querySelector("#year-from")
    .addEventListener("input", filterMovies);
  document
    .querySelector("#year-to")
    .addEventListener("input", filterMovies);
  document
    .querySelector("#rating-from")
    .addEventListener("input", filterMovies);
   document
    .querySelector("#rating-to")
    .addEventListener("input", filterMovies);
  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);
}

async function getMovies() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/movies.json"
  );
  allMovies = await response.json();
  populateGenreDropdown();
  displayMovies(allMovies);
}
function displayMovies(movies) {
  console.log(`🎬 Viser ${movies.length} movies`);
  document.querySelector("#movie-list").innerHTML = "";
  for (const movie of movies) {
    displayMovie(movie);
  }
}

function displayMovie(movie) {
  const movieList = document.querySelector("#movie-list");

  const movieHTML = `
    <article class="movie-card" tabindex="0">
      <img src="${movie.image}" 
           alt="Poster of ${movie.title}" 
           class="movie-poster" />
      <div class="movie-info">
        <h3>${movie.title} <span class="movie-year">(${movie.year})</span></h3>
        <p class="movie-genre">${movie.genre.join(", ")}</p>
        <p class="movie-rating">⭐ ${movie.rating}</p>
        <p class="movie-director"><strong>Director:</strong> ${
          movie.director
        }</p>
      </div>
    </article>
  `;

  movieList.insertAdjacentHTML("beforeend", movieHTML);

  // Tilføj click event til den nye card
  const newCard = movieList.lastElementChild;

  newCard.addEventListener("click", function () {
    console.log(`🎬 Klik på: "${movie.title}"`);
    showMovieModal(movie);
  });
}

function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select");
  const genres = new Set();

  for (const movie of allMovies) {
    for (const genre of movie.genre) {
      genres.add(genre);
    }
  }

  genreSelect.innerHTML = '<option value="all">Alle genrer</option>';

  const sortedGenres = Array.from(genres).sort();
  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}

function filterMovies() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;
  const yearFrom = Number(document.querySelector("#year-from").value) || 0;
  const yearTo = Number(document.querySelector("#year-to").value) || 9999;
  const ratingFrom = Number(document.querySelector("#rating-from").value) || 0;
  const ratingTo = Number(document.querySelector("#rating-to").value) || 10;

  console.log("År filter:", yearFrom, "til", yearTo);

  // Start med alle movies
  let filteredMovies = allMovies;

  // TRIN 1: Filtrer på søgetekst
  if (searchValue) {
    filteredMovies = filteredMovies.filter((movie) => {
      return movie.title.toLowerCase().includes(searchValue);
    });
  }

  // TRIN 2: Filtrer på genre
  if (genreValue !== "all") {
    filteredMovies = filteredMovies.filter((movie) => {
      return movie.genre.includes(genreValue);
    });
  }
  // Tilføj EFTER genre filter, FØR sortering

  // År range filter - TILFØJ DENNE SEKTION
  if (yearFrom > 0 || yearTo < 9999) {
    console.log("Anvender år filter:", yearFrom, "-", yearTo);
    const before = filteredMovies.length;

    filteredMovies = filteredMovies.filter((movie) => {
      return movie.year >= yearFrom && movie.year <= yearTo;
    });

    console.log("År filter:", before, "→", filteredMovies.length, "film");
  } else {
    console.log("Ingen år filter (alle år)");
  }

  // Rating range filter - TILFØJ EFTER år filter
  if (ratingFrom > 0 || ratingTo < 10) {
    console.log("Anvender rating filter:", ratingFrom, "-", ratingTo);
    const before = filteredMovies.length;

    filteredMovies = filteredMovies.filter((movie) => {
      return movie.rating >= ratingFrom && movie.rating <= ratingTo;
    });

    console.log("Rating filter:", before, "→", filteredMovies.length, "film");
  } else {
    console.log("Ingen rating filter (alle ratings)");
  }

  // TRIN 3: Sorter resultater
  if (sortValue === "title") {
    filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "year") {
    filteredMovies.sort((a, b) => b.year - a.year); // Nyeste først
  } else if (sortValue === "rating") {
    filteredMovies.sort((a, b) => b.rating - a.rating); // Højeste først
  }

  displayMovies(filteredMovies);
}

function showMovieDetails(movie) {
  console.log("📊 Viser detaljer for:", movie.title);

  // Vis i alert (midlertidig løsning)
  const movieInfo = `🎬 ${movie.title} (${movie.year})
🎭 ${movie.genre.join(", ")}
⭐ Rating: ${movie.rating}
🎯 Instruktør: ${movie.director}
👥 Skuespillere: ${movie.actors.join(", ")}

📝 ${movie.description}`;

  alert(movieInfo);

  // TODO: Næste gang laver vi modal dialog!
}

function clearAllFilters() {
  console.log("🗑️ Rydder alle filtre");

  // Ryd søgning og dropdown felter
  document.querySelector("#search-input").value = "";
  document.querySelector("#genre-select").value = "all";
  document.querySelector("#sort-select").value = "none";

  // Ryd de nye range felter
  document.querySelector("#year-from").value = "";
  document.querySelector("#year-to").value = "";
  document.querySelector("#rating-from").value = "";
  document.querySelector("#rating-to").value = "";

  // Kør filtrering igen (viser alle film)
  filterMovies();
}



newCard.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showMovieModal(movie);
  }
});

// #8: Vis movie i modal dialog
function showMovieModal(movie) {
  console.log("🎭 Åbner modal for:", movie.title);

  // Byg HTML struktur dynamisk
  const dialogContent = document.querySelector("#dialog-content");
  dialogContent.innerHTML = `
    <img src="${movie.image}" alt="Poster af ${movie.title}" class="movie-poster">
    <div class="dialog-details">
      <h2>${movie.title} <span class="movie-year">(${movie.year})</span></h2>
      <p class="movie-genre">${movie.genre.join(", ")}</p>
      <p class="movie-rating">⭐ ${movie.rating}</p>
      <p><strong>Director:</strong> ${movie.director}</p>
      <p><strong>Actors:</strong> ${movie.actors.join(", ")}</p>
      <p class="movie-description">${movie.description}</p>
    </div>
  `;
    document.querySelector("#movie-dialog").showModal();
}


//hej//