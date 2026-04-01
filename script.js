const API_URL = "https://riddles-api.vercel.app/random";

const container = document.getElementById("riddleContainer");
const loading = document.getElementById("loading");
const nextBtn = document.getElementById("nextRiddle");

async function fetchRiddle() {

  try {

    loading.style.display = "block";

    const response = await fetch(API_URL);
    const data = await response.json();

    loading.style.display = "none";

    displayRiddle(data);

  } catch (error) {

    loading.textContent = "Failed to load riddles.";
    console.error(error);

  }

}

function displayRiddle(data) {

  const riddleText = data.riddle || data.data?.riddle;
  const answerText = data.answer || data.data?.answer;

  container.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("riddle-card");

  card.innerHTML = `
    <p><strong>Riddle:</strong> ${riddleText}</p>
    <button class="reveal-btn">Reveal Answer</button>
    <p class="answer" style="display:none"><strong>Answer:</strong> ${answerText}</p>
  `;

  const button = card.querySelector(".reveal-btn");
  const answer = card.querySelector(".answer");

  button.addEventListener("click", () => {
    answer.style.display = "block";
  });

  container.appendChild(card);

}

nextBtn.addEventListener("click", fetchRiddle);

fetchRiddle();
