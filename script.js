let players = [];
let currentPlayerIndex = 0;
let usedQuestions = { truth: [], action: [] };
let playerOrder = "random";
let currentQuestionType = null;
let isSpinning = false; // Флаг для отслеживания состояния рулетки

const addPlayerBtn = document.getElementById("addPlayerBtn");
const playersList = document.getElementById("playersList");
const startGameBtn = document.getElementById("startGameBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const currentPlayer = document.getElementById("currentPlayer");
const truthBtn = document.getElementById("truthBtn");
const actionBtn = document.getElementById("actionBtn");
const question = document.getElementById("question");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const playerOrderSelect = document.getElementById("playerOrder");
const skipBtn = document.getElementById("skipBtn");
const playerCarousel = document.getElementById("playerCarousel");

// Добавляем два игрока по умолчанию при загрузке
document.addEventListener("DOMContentLoaded", () => {
  addPlayer();
  addPlayer();
});

// Обработчики событий
addPlayerBtn.addEventListener("click", addPlayer);
startGameBtn.addEventListener("click", startGame);
truthBtn.addEventListener("click", () => {
  currentQuestionType = "truth";
  showQuestion("truth");
});
actionBtn.addEventListener("click", () => {
  currentQuestionType = "action";
  showQuestion("action");
});
nextPlayerBtn.addEventListener("click", nextPlayer);
backToMenuBtn.addEventListener("click", backToMenu);
playerOrderSelect.addEventListener("change", (event) => {
  playerOrder = event.target.value;
  if (playerOrder === "order") {
    setupPlayerCarousel();
  }
});
skipBtn.addEventListener("click", skipQuestion);

// Добавление игрока
function addPlayer() {
  if (playersList.children.length >= 20) {
    alert("Максимум 20 игроков!");
    return;
  }

  const playerInput = document.createElement("div");
  playerInput.classList.add("playerInput");
  playerInput.innerHTML = `
    <input type="text" class="playerName" placeholder="Имя" maxlength="20">
    <select class="genderSelect">
      <option value="male">Муж</option>
      <option value="female">Жен</option>
    </select>
    <select class="orientationSelect">
      <option value="any">Неважно</option>
      <option value="male">Муж</option>
      <option value="female">Жен</option>
    </select>
    <button class="deletePlayerBtn">
      <img src="img/delete.svg" alt="Удалить" width="16" height="16">
    </button>
  `;

  const inputField = playerInput.querySelector(".playerName");
  const deleteBtn = playerInput.querySelector(".deletePlayerBtn");

  inputField.addEventListener("input", () => validateUniqueName(inputField));
  deleteBtn.addEventListener("click", () => {
    playerInput.remove();
    savePlayers();
  });

  playersList.appendChild(playerInput);
}

// Проверка на уникальность имени
function validateUniqueName(inputField) {
  const name = inputField.value.trim().toLowerCase();
  const allNames = Array.from(document.querySelectorAll(".playerName"))
                        .map(input => input.value.trim().toLowerCase());

  if (allNames.filter(n => n === name).length > 1) {
    inputField.style.border = "2px solid red";
  } else {
    inputField.style.border = "";
  }
}

// Запуск игры
function startGame() {
  players = [];
  const playerInputs = document.querySelectorAll(".playerInput");
  let nameSet = new Set();

  for (const input of playerInputs) {
    const name = input.querySelector(".playerName").value.trim();
    const gender = input.querySelector(".genderSelect").value;
    const orientation = input.querySelector(".orientationSelect").value;

    if (nameSet.has(name.toLowerCase())) {
      alert(`Имя '${name}' уже есть! Пожалуйста, выберите другое.`);
      return;
    }
    nameSet.add(name.toLowerCase());

    if (name) {
      players.push({ name, gender, orientation });
    }
  }

  if (players.length < 2) {
    alert("Нужно добавить хотя бы двух игроков!");
    return;
  }

  currentPlayerIndex = 0;
  if (playerOrder === "random") {
    shuffle(players);
    spinPlayerCarousel();
  } else {
    spinPlayerCarousel(); // Прокручиваем рулетку один раз для выбора первого игрока
  }
  savePlayers();
  menu.style.display = "none";
  game.style.display = "block";
  resetGameUI();
}

// Сброс UI игры
function resetGameUI() {
  truthBtn.style.display = "none";
  actionBtn.style.display = "none";
  skipBtn.style.display = "none";
  nextPlayerBtn.style.display = "none";
  question.textContent = "";
}

// Показать текущего игрока
function showPlayer() {
  if (currentPlayer) {
    currentPlayer.textContent = players[currentPlayerIndex].name;
  }
  if (playerOrder === "order") {
    setupPlayerCarousel();
  }
  truthBtn.style.display = "inline-block";
  actionBtn.style.display = "inline-block";
}

// Показать вопрос
function showQuestion(type) {
  const player = players[currentPlayerIndex];
  let availableQuestions = questionsDatabase[type].filter(
    (q) => !usedQuestions[type].includes(q)
  );

  if (availableQuestions.length === 0) {
    question.textContent = "Вопросы закончились!";
    truthBtn.style.display = "none";
    actionBtn.style.display = "none";
    skipBtn.style.display = "none";
    nextPlayerBtn.style.display = "inline-block";
    return;
  }

  let selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

  if (selectedQuestion.includes("{playerName}")) {
    let otherPlayers = players.filter((p) => p !== player);

    let filteredPlayers = otherPlayers.filter(
      (p) => player.orientation === "any" || p.gender === player.orientation
    );

    if (filteredPlayers.length === 0) {
      filteredPlayers = otherPlayers;
    }

    if (filteredPlayers.length > 0) {
      let randomPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
      selectedQuestion = selectedQuestion.replace("{playerName}", randomPlayer.name);
    } else {
      selectedQuestion = selectedQuestion.replace(" с игроком \"{playerName}\"", "");
    }
  }

  question.style.opacity = "0";
  setTimeout(() => {
    question.textContent = type === "truth" ? `Правда: ${selectedQuestion}` : `Действие: ${selectedQuestion}`;
    question.style.opacity = "1";
  }, 300);

  usedQuestions[type].push(selectedQuestion);

  truthBtn.style.display = "none";
  actionBtn.style.display = "none";
  skipBtn.style.display = "inline-block";
  nextPlayerBtn.style.display = "inline-block";
}

// Пропустить вопрос
function skipQuestion() {
  if (currentQuestionType) {
    showQuestion(currentQuestionType);
  }
}

// Переключение игрока
function nextPlayer() {
  resetGameUI();
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  if (playerOrder === "random") {
    spinPlayerCarousel();
  } else {
    showPlayer();
  }
}

// Вернуться в меню
function backToMenu() {
  game.style.display = "none";
  menu.style.display = "block";
}

// Сохранение игроков
function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}

// Перемешивание массива
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Настройка ленты игроков (по порядку)
function setupPlayerCarousel() {
  if (!playerCarousel) return;

  playerCarousel.innerHTML = '';
  const previousIndex = (currentPlayerIndex - 1 + players.length) % players.length;
  const nextIndex = (currentPlayerIndex + 1) % players.length;

  const previousPlayer = document.createElement('div');
  previousPlayer.classList.add('player', 'previous');
  previousPlayer.textContent = players[previousIndex].name;
  playerCarousel.appendChild(previousPlayer);

  const currentPlayerElement = document.createElement('div');
  currentPlayerElement.classList.add('player', 'active');
  currentPlayerElement.textContent = players[currentPlayerIndex].name;
  playerCarousel.appendChild(currentPlayerElement);

  const nextPlayerElement = document.createElement('div');
  nextPlayerElement.classList.add('player', 'next');
  nextPlayerElement.textContent = players[nextIndex].name;
  playerCarousel.appendChild(nextPlayerElement);
}

// Анимация рулетки
function spinPlayerCarousel() {
  isSpinning = true;
  resetGameUI();
  const spinDuration = 4000 + Math.random() * 3000; // От 3 до 5 секунд
  const startTime = Date.now();
  const spinInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime >= spinDuration) {
      clearInterval(spinInterval);
      isSpinning = false;
      setupPlayerCarousel();
      truthBtn.style.display = "inline-block";
      actionBtn.style.display = "inline-block";
    } else {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      setupPlayerCarousel();
    }
  }, 100);
}