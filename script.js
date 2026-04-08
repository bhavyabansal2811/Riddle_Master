const API_URL = "https://riddles-api.vercel.app/random";

const container = document.getElementById("riddleContainer");
const loading = document.getElementById("loading");
const nextBtn = document.getElementById("nextRiddle");
const filterSelect = document.getElementById("filterSelect");
const toggleBtn = document.getElementById("toggleTheme");

let currentRiddle = null;

// Fetch riddle
async function fetchRiddle() {
  try {
    loading.style.display = "block";

    const res = await fetch(API_URL);
    const data = await res.json();

    loading.style.display = "none";

    currentRiddle = {
      riddle: data.riddle || data.data?.riddle,
      answer: data.answer || data.data?.answer
    };

    applyFilter();

  } catch (err) {
    loading.textContent = "Failed to load riddle";
  }
}

// Display
function displayRiddle(item) {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "riddle-card";

  card.innerHTML = `
    <p><strong>Riddle:</strong> ${item.riddle}</p>
    <button>Reveal Answer</button>
    <p class="answer" style="display:none"><strong>Answer:</strong> ${item.answer}</p>
  `;

  const btn = card.querySelector("button");
  const ans = card.querySelector(".answer");

  btn.addEventListener("click", () => {
    ans.style.display = "block";
  });

  container.appendChild(card);
}
function applyFilter() {
  if (!currentRiddle) return;

  const value = filterSelect.value;

  const result = [currentRiddle].filter(item => {
    const length = item.riddle.length;
    const words = item.riddle.split(" ").length;

    if (value === "short") return length <= 100;
    if (value === "long") return length > 100;
    if (value === "easy") return words <= 40;
    if (value === "hard") return words > 40;

    return true;
  });

  if (result.length > 0) {
    displayRiddle(result[0]);
  } else {
    displayRiddle(currentRiddle);
  }
}
nextBtn.addEventListener("click", fetchRiddle);
filterSelect.addEventListener("change", applyFilter);

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

fetchRiddle();
