
// API fetch here 👍🏼

const API_URL = "https://riddles-api.vercel.app/random";

// idhr sab kuch get element by id kr diya starting me

var container = document.getElementById("riddleContainer");
var loading = document.getElementById("loading");
var nextBtn = document.getElementById("nextRiddle");
var loadManyBtn = document.getElementById("loadMany");
var filterSelect = document.getElementById("filterSelect");
var sortSelect = document.getElementById("sortSelect");
var toggleBtn = document.getElementById("toggleTheme");
var searchInput = document.getElementById("searchInput");
var searchResults = document.getElementById("searchResults");
var favContainer = document.getElementById("favContainer");
var favEmpty = document.getElementById("favEmpty");
var clearFavsBtn = document.getElementById("clearFavs");

// empty area for storage of all loaded riddles...needed very much
var allRiddles = [];

// Load favorites from localStorage
var favorites = JSON.parse(localStorage.getItem("riddleFavorites")) || [];

// most important part of project.....fetching the riddle and showing it on the webpage.
async function fetchRiddle() {
  try {
    loading.style.display = "block";
    container.innerHTML = "";

    var res = await fetch(API_URL);
    var data = await res.json();

    loading.style.display = "none";

    var riddle = {
      riddle: data.riddle,
      answer: data.answer
    };

    allRiddles = [riddle];
    showRiddles(allRiddles);

  } catch (err) {
    loading.textContent = "❌ Failed to load. Please try again.";
  }
}

// ai idea but executed by myself also
async function fetchManyRiddles() {
  try {
    loading.style.display = "block";
    container.innerHTML = "";
    allRiddles = [];

    // ye idea ai ka tha to fetch 5 times but execution was collaborative
    var promises = [];
    for (var i = 0; i < 5; i++) {
      promises.push(fetch(API_URL).then(function(res) { return res.json(); }));
    }

    var results = await Promise.all(promises);

    results.forEach(function(data) {
      allRiddles.push({
        riddle: data.riddle,
        answer: data.answer
      });
    });

    loading.style.display = "none";
    applyFilterAndSort();

  } catch (err) {
    loading.textContent = "❌ Failed to load. Please try again.";
  }
}

// Filter area started form here
function applyFilter(list) {
  var value = filterSelect.value;

  var filtered = list.filter(function(item) {
    var wordCount = item.answer.trim().split(" ").length;

    if (value === "one") return wordCount === 1;
    if (value === "two") return wordCount === 2;
    if (value === "long") return wordCount >= 3;

    return true; // "all"
  });

  return filtered;
}

// SORT wala area
function applySort(list) {
  var value = sortSelect.value;

  // We copy the array so we don't mess up the original
  var sorted = list.slice();

  if (value === "asc") {
    sorted = sorted.sort(function(a, b) {
      return a.riddle.localeCompare(b.riddle);
    });
  } else if (value === "desc") {
    sorted = sorted.sort(function(a, b) {
      return b.riddle.localeCompare(a.riddle);
    });
  } else if (value === "shortFirst") {
    sorted = sorted.sort(function(a, b) {
      return a.riddle.length - b.riddle.length;
    });
  } else if (value === "longFirst") {
    sorted = sorted.sort(function(a, b) {
      return b.riddle.length - a.riddle.length;
    });
  }

  return sorted;
}

//  idhr apply kr diya
function applyFilterAndSort() {
  var filtered = applyFilter(allRiddles);
  var sorted = applySort(filtered);

  if (sorted.length === 0) {
    container.innerHTML = "<p>No riddles match this filter. Try another one!</p>";
  } else {
    showRiddles(sorted);
  }
}

// --> yahan se code riddle show ho rhi
function showRiddles(list) {
  container.innerHTML = "";

  list.forEach(function(item) {
    var card = createRiddleCard(item, false);
    container.appendChild(card);
  });
}

// idhr se riddle card banna shuru
function createRiddleCard(item, isFav) {
  var card = document.createElement("div");
  card.className = "riddle-card";

  var alreadyFav = favorites.some(function(f) { return f.riddle === item.riddle; });

  card.innerHTML = `
    <p class="riddle-text"><strong>Q:</strong> ${item.riddle}</p>
    <div class="card-buttons">
      <button class="reveal-btn">👁 Reveal Answer</button>
      ${!isFav ? `<button class="fav-btn ${alreadyFav ? 'saved' : ''}">${alreadyFav ? '⭐ Saved' : '☆ Favorite'}</button>` : ''}
    </div>
    <p class="answer" style="display:none"><strong>A:</strong> ${item.answer}</p>
  `;

  var revealBtn = card.querySelector(".reveal-btn");
  var answerP = card.querySelector(".answer");

  revealBtn.addEventListener("click", function() {
    if (answerP.style.display === "none") {
      answerP.style.display = "block";
      revealBtn.textContent = "🙈 Hide Answer";
    } else {
      answerP.style.display = "none";
      revealBtn.textContent = "👁 Reveal Answer";
    }
  });

  if (!isFav) {
    var favBtn = card.querySelector(".fav-btn");
    favBtn.addEventListener("click", function() {
      addToFavorites(item, favBtn);
    });
  }

  return card;
}

// Favourites pannel with the help of AI
function addToFavorites(item, btn) {
  var alreadyExists = favorites.some(function(f) { return f.riddle === item.riddle; });

  if (alreadyExists) {
    alert("This riddle is already in your favorites!");
    return;
  }

  favorites.push(item);
  localStorage.setItem("riddleFavorites", JSON.stringify(favorites));

  btn.textContent = "⭐ Saved";
  btn.classList.add("saved");

  renderFavorites();
}

// YE bhi same as above
function renderFavorites() {
  favContainer.innerHTML = "";

  if (favorites.length === 0) {
    favEmpty.style.display = "block";
    return;
  }

  favEmpty.style.display = "none";

  favorites.forEach(function(item) {
    var card = createRiddleCard(item, true);
    favContainer.appendChild(card);
  });
}

// clear favorites area done myself 60%
clearFavsBtn.addEventListener("click", function() {
  favorites = [];
  localStorage.setItem("riddleFavorites", JSON.stringify(favorites));
  renderFavorites();
});

// search.....took help of ai...as using something called debounce...will learn about it
var searchTimer;
searchInput.addEventListener("input", function() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    doSearch();
  }, 400);
});

function doSearch() {
  var keyword = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = "";

  if (keyword === "") {
    searchResults.innerHTML = "<p>Type something above to search!</p>";
    return;
  }

  var results = allRiddles.filter(function(item) {
    return item.riddle.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword);
  });

  if (results.length === 0) {
    searchResults.innerHTML = "<p>No riddles found matching <strong>" + keyword + "</strong>. Try loading more riddles first!</p>";
    return;
  }

  results.forEach(function(item) {
    var card = createRiddleCard(item, false);
    searchResults.appendChild(card);
  });
}

// my favourite DARK MODE from here

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

toggleBtn.addEventListener("click", function() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});
nextBtn.addEventListener("click", fetchRiddle);
loadManyBtn.addEventListener("click", fetchManyRiddles);
filterSelect.addEventListener("change", applyFilterAndSort);
sortSelect.addEventListener("change", applyFilterAndSort);

// prretier se code pretty kr diya in last to show to the judges

fetchRiddle();
renderFavorites();
