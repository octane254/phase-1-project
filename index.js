const apiKey = "2eca7df3b0a36b8a5275092058befc94"; 
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("searchResults");

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
    }
  });

  async function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      displayResults(data.results);
    } catch (err) {
      console.error("Search failed:", err);
    }
  }

  function displayResults(movies) {
    resultsContainer.innerHTML = "";

    if (movies.length === 0) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    movies.forEach(movie => {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";

      const item = document.createElement("div");
      item.className = "portfolio-item";
      item.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date || "No date"}</p>
        <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "No overview available."}</p>
      `;
      resultsContainer.appendChild(item);
    });
  }
  