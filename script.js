// ===== DOM =====
const pickView = document.getElementById("pickView");
const playView = document.getElementById("playView");

const pickGrid = document.getElementById("pickGrid");
const playGrid = document.getElementById("playGrid");

const countEl = document.getElementById("count");
const warn = document.getElementById("warn");
const now = document.getElementById("now");

const allBtn = document.getElementById("allBtn");
const noneBtn = document.getElementById("noneBtn");

const rateInput = document.getElementById("rate");
const stopBtn = document.getElementById("stopBtn");

// ===== Data =====
const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)); // a-z
let selected = new Set(loadSelected() ?? ["a","c","g","h","i","j","m","n","p","t"]); // 沒選過就給你一組預設
// ===== 預先載入音檔（降低播放延遲）=====
const audioPool = {};

function preloadAudio(letters) {
  letters.forEach(ch => {
    const a = new Audio(`audio/${ch}.mp3`);
    a.preload = "auto";
    audioPool[ch] = a;
  });
}


// ===== Init =====
renderPick();
updateCount();

function show(which) {
  if (which === "pick") {
    pickView.classList.remove("hidden");
    playView.classList.add("hidden");
    stopAll();
    return;
  }

  // play
  if (selected.size === 0) {
    alert("至少選一個字母！");
    return;
  }
  pickView.classList.add("hidden");
  playView.classList.remove("hidden");
  renderPlay();

   preloadAudio([...selected]);

  renderPlay();
}

// ===== Pick View =====
function renderPick() {
  pickGrid.innerHTML = "";
  letters.forEach(ch => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "letter";
    btn.dataset.letter = ch;
    btn.innerHTML = `<div class="big">${ch.toUpperCase()}${ch}</div><div class="sub">選擇</div>`;

    btn.addEventListener("click", () => {
      if (selected.has(ch)) selected.delete(ch);
      else selected.add(ch);
      saveSelected([...selected].sort());
      btn.classList.toggle("selected", selected.has(ch));
      updateCount();
    });

    if (selected.has(ch)) btn.classList.add("selected");
    pickGrid.appendChild(btn);
  });
}

allBtn.addEventListener("click", () => {
  selected = new Set(letters);
  saveSelected([...selected]);
  renderPick();
  updateCount();
});

noneBtn.addEventListener("click", () => {
  selected = new Set();
  saveSelected([]);
  renderPick();
  updateCount();
});

function updateCount() {
  countEl.textContent = String(selected.size);
}

// ===== Play View =====
let currentAudio = null;

function renderPlay() {
  playGrid.innerHTML = "";
  const arr = [...selected].sort();

  warn.textContent = `已載入 ${arr.length} 個字母：${arr.join(", ")}`;

  arr.forEach(ch => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "letter";
    btn.dataset.letter = ch;
    btn.innerHTML = `<div class="big">${ch.toUpperCase()}${ch}</div><div class="sub">phonics</div>`;

    btn.addEventListener("click", () => playLetter(ch, btn));
    playGrid.appendChild(btn);
  });
}

function playLetter(letter, btn) {
  stopAll();

  const src = `audio/${letter}.mp3`;

// ✅ 保底：如果 pool 沒有，就現建一個（避免 undefined）
let audio = audioPool[letter];
if (!audio) {
  audio = new Audio(src);
  audio.preload = "auto";
  audioPool[letter] = audio;
}

currentAudio = audio;
audio.currentTime = 0;

  now.textContent = `${letter.toUpperCase()}${letter}`;

  // 視覺回饋：播放中的按鈕
  for (const b of playGrid.querySelectorAll(".letter")) b.classList.remove("playing");
  btn.classList.add("playing");

  // 速度：音檔播放速度
  audio.playbackRate = Number(rateInput?.value ?? 1);

  audio.onerror = () => {
    alert(`找不到或無法播放：${src}\n請確認 audio 資料夾與檔名（小寫 a.mp3 ~ z.mp3）`);
    btn.classList.remove("playing");
    now.textContent = "（播放失敗）";
  };

  audio.onended = () => {
    btn.classList.remove("playing");
    now.textContent = `${letter.toUpperCase()}${letter}（播放完成）`;
  };

  audio.play().catch(() => {
    alert("iPad/手機可能需要再點一次才允許播放聲音（系統限制）。");
    btn.classList.remove("playing");
  });
}

stopBtn.addEventListener("click", stopAll);

function stopAll() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  for (const b of playGrid.querySelectorAll(".letter")) b.classList.remove("playing");
  now.textContent = "（已停止）";
}

// ===== Storage =====
function saveSelected(arr) {
  localStorage.setItem("selectedLetters", JSON.stringify(arr));
}
function loadSelected() {
  try {
    const arr = JSON.parse(localStorage.getItem("selectedLetters"));
    return (Array.isArray(arr) ? arr : [])
      .map(x => String(x).toLowerCase())
      .filter(ch => /^[a-z]$/.test(ch));
  } catch {
    return null;
  }
}
// ===== 比手畫腳抽選系統 =====
const wordInput = document.getElementById("wordInput");
const loadWordsBtn = document.getElementById("loadWords");
const drawBtn = document.getElementById("drawBtn");
const drawResult = document.getElementById("drawResult");

let words = [];

loadWordsBtn?.addEventListener("click", () => {
  const raw = wordInput.value;
  words = raw
    .split(/[\n,]/)
    .map(w => w.trim())
    .filter(w => w.length > 0);

  alert(`已加入 ${words.length} 個詞`);
});

drawBtn?.addEventListener("click", () => {
  if (words.length === 0) {
    alert("請先加入詞彙！");
    return;
  }
  const pick = words[Math.floor(Math.random() * words.length)];
  drawResult.textContent = pick;
});

// ===== 上方導覽切換（字母發音 / 比手畫腳）=====
const navButtons = document.querySelectorAll(".nav-btn");
const lettersView = document.getElementById("lettersView");
const drawView = document.getElementById("drawView");
const speedWrap = document.getElementById("speedWrap");

function setView(view) {
  // active 樣式
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.view === view));

  if (view === "letters") {
    lettersView?.classList.remove("hidden");
    drawView?.classList.add("hidden");
    speedWrap?.classList.remove("hidden");

    // ✅ 回到字母功能時，預設顯示「選字母」
    show("pick");
  } else if (view === "draw") {
    lettersView?.classList.add("hidden");
    drawView?.classList.remove("hidden");
    speedWrap?.classList.add("hidden");

    stopAll();
  }
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

// 預設進站：字母發音
setView("letters");



