const apiKey = "2eca7df3b0a36b8a5275092058befc94";
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("searchResults");

// Handle form submit
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
});

// On page load, get search query from URL
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
  searchInput.value = query;
  searchMovies(query);
}

// Fetch movies from TMDb
async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.results);
  } catch (err) {
    console.error("Search failed:", err);
    resultsContainer.innerHTML = "<p>Error loading results.</p>";
  }
}

// Display search results
function displayResults(movies) {
  resultsContainer.innerHTML = "";

  if (!movies.length) {
    resultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  movies.forEach((movie) => {
    const movieId = movie.id;
    const movieTitle = movie.title;
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";

    const reviews = getReviews(movieId);

    const item = document.createElement("div");
    item.className = "portfolio-item";
    item.innerHTML = `
      <img src="${poster}" alt="${movieTitle}">
      <h3>${movieTitle}</h3>
      <p>${movie.release_date || "No date"}</p>
      <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "No overview available."}</p>

      <div class="review-section">
        <h4>User Reviews</h4>
        <ul class="review-list" id="review-list-${movieId}">
          ${reviews.length ? reviews.map(r => renderReviewHTML(r)).join("") : "<li>No reviews yet.</li>"}
        </ul>

        <form class="review-form" data-movie-id="${movieId}">
          <div class="star-rating">
            ${[1,2,3,4,5].map(n => `<span data-rating="${n}">★</span>`).join("")}
          </div>
          <input type="text" placeholder="Write a review..." required />
          <button type="submit">Submit</button>
        </form>
      </div>
    `;
    resultsContainer.appendChild(item);
  });
}

// Render review as HTML
function renderReviewHTML(review) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  return `<li><strong>${stars}</strong> ${review.text} <button class="delete-review" title="Delete">✕</button></li>`;
}

// Review submission handler
document.addEventListener("submit", (e) => {
  if (e.target.classList.contains("review-form")) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector("input");
    const rating = parseInt(form.dataset.rating) || 0;
    const movieId = form.dataset.movieId;
    const reviewText = input.value.trim();
    const reviewList = document.getElementById(`review-list-${movieId}`);

    if (!reviewText || rating === 0) return;

    const review = { text: reviewText, rating };
    const reviews = getReviews(movieId);
    reviews.push(review);
    saveReviews(movieId, reviews);

    // Update DOM
    if (reviewList.innerText.includes("No reviews yet.")) reviewList.innerHTML = "";
    reviewList.insertAdjacentHTML("beforeend", renderReviewHTML(review));

    // Reset form
    input.value = "";
    form.dataset.rating = 0;
    form.querySelectorAll(".star-rating span").forEach(span => span.classList.remove("selected"));
  }
});

// Handle star rating clicks
document.addEventListener("click", (e) => {
  if (e.target.matches(".star-rating span")) {
    const span = e.target;
    const form = span.closest("form");
    const stars = form.querySelectorAll("span");
    const rating = parseInt(span.dataset.rating);
    stars.forEach((s, i) => {
      s.classList.toggle("selected", i < rating);
    });
    form.dataset.rating = rating;
  }

  // Delete review
  if (e.target.classList.contains("delete-review")) {
    const li = e.target.closest("li");
    const ul = li.parentElement;
    const movieId = ul.id.replace("review-list-", "");
    const index = [...ul.children].indexOf(li);
    const reviews = getReviews(movieId);
    reviews.splice(index, 1);
    saveReviews(movieId, reviews);
    li.remove();
    if (ul.children.length === 0) ul.innerHTML = "<li>No reviews yet.</li>";
  }
});

// LocalStorage helpers
function getReviews(movieId) {
  const data = localStorage.getItem(`reviews_${movieId}`);
  return data ? JSON.parse(data) : [];
}

function saveReviews(movieId, reviews) {
  localStorage.setItem(`reviews_${movieId}`, JSON.stringify(reviews));
}
