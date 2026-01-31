document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // --- 初始化元素 ---
  const views = {
    home: $("homeView"),
    letters: $("lettersView"),
    draw: $("drawView"),
    memory: $("memoryView")
  };
  const navBtns = {
    home: $("navHome"),
    letters: $("navLetters"),
    draw: $("navDraw"),
    memory: $("navMemory")
  };

  // --- 視窗切換邏輯 ---
  function showView(target) {
    Object.values(views).forEach(v => v.classList.add("hidden"));
    Object.values(navBtns).forEach(b => b.classList.remove("active"));
    
    views[target].classList.remove("hidden");
    if(navBtns[target]) navBtns[target].classList.add("active");
    
    // 控制頂部工具列
    $("speedWrap").classList.toggle("hidden", target === "home" || target === "draw");
    $("stopBtn").classList.toggle("hidden", target !== "letters");

    if (target === "letters") renderLetters();
    if (target === "memory") renderMemoryPick();
    speechSynthesis.cancel();
  }

  // --- 字母發音系統 ---
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let selectedLetters = new Set(letters.slice(0, 8));

  function renderLetters() {
    const pickGrid = $("pickGrid");
    const playGrid = $("playGrid");
    pickGrid.innerHTML = "";
    playGrid.innerHTML = "";

    letters.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = `nav-btn ${selectedLetters.has(ch) ? 'active' : ''}`;
      btn.textContent = ch.toUpperCase();
      btn.onclick = () => {
        selectedLetters.has(ch) ? selectedLetters.delete(ch) : selectedLetters.add(ch);
        renderLetters();
      };
      pickGrid.appendChild(btn);
    });

    [...selectedLetters].forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "card";
      btn.style.textAlign = "center";
      btn.innerHTML = `<h1 style="margin:0">${ch.toUpperCase()}</h1>`;
      btn.onclick = () => {
        const audio = new Audio(`audio/${ch}.mp3`);
        audio.playbackRate = $("rate").value;
        audio.play().catch(() => speak(ch)); // 若沒音檔則用 TTS
      };
      playGrid.appendChild(btn);
    });
  }

  // --- 語音功能 (TTS) ---
  function speak(text) {
    speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.rate = $("rate").value;
    uttr.lang = "en-US";
    speechSynthesis.speak(uttr);
  }

  // --- 比手畫腳抽籤 ---
  let words = [];
  $("loadWords").onclick = () => {
    words = $("wordInput").value.split(/[\n,]/).map(w => w.trim()).filter(Boolean);
    alert(`已載入 ${words.length} 個單字`);
  };
  $("drawBtn").onclick = () => {
    if (!words.length) return alert("請先輸入單字並點擊加入清單");
    const idx = Math.floor(Math.random() * words.length);
    const word = words[idx];
    $("drawResult").textContent = word;
    speak(word);
  };

  // --- 記憶翻牌遊戲 ---
  const memoryData = [
    { word: "ham", img: "images/memory/ham.jpg" },
    { word: "ant", img: "images/memory/ant.jpg" },
    { word: "apple", img: "images/memory/apple.jpg" },
    { word: "bee", img: "images/memory/bee.jpg" }
    // ... 可自行增加
  ];
  let chosenMemory = [];

  function renderMemoryPick() {
    const grid = $("memoryPickGrid");
    grid.innerHTML = "";
    memoryData.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.textContent = item.word;
      btn.onclick = () => {
        chosenMemory.push(item);
        if (chosenMemory.length >= 4) startMemoryGame();
      };
      grid.appendChild(btn);
    });
  }

  function startMemoryGame() {
    const gameGrid = $("memoryGameGrid");
    gameGrid.innerHTML = "";
    // 建立配對池（一張圖，一張字）
    let cards = [];
    chosenMemory.forEach(item => {
      cards.push({ ...item, type: 'img' });
      cards.push({ ...item, type: 'word' });
    });
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((data, index) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-back">?</div>
          <div class="memory-front">
            ${data.type === 'img' ? `<img src="${data.img}">` : `<span>${data.word}</span>`}
          </div>
        </div>`;
      card.onclick = () => handleFlip(card, data);
      gameGrid.appendChild(card);
    });
    chosenMemory = []; // 清空以便下次選擇
  }

  let flippedCards = [];
  function handleFlip(cardEl, data) {
    if (flippedCards.length < 2 && !cardEl.classList.contains("flipped")) {
      cardEl.classList.add("flipped");
      flippedCards.push({ el: cardEl, data: data });

      if (flippedCards.length === 2) {
        const [c1, c2] = flippedCards;
        if (c1.data.word === c2.data.word) {
          speak(c1.data.word);
          setTimeout(() => {
            c1.el.classList.add("matched");
            c2.el.classList.add("matched");
            flippedCards = [];
          }, 600);
        } else {
          setTimeout(() => {
            c1.el.classList.remove("flipped");
            c2.el.classList.remove("flipped");
            flippedCards = [];
          }, 1000);
        }
      }
    }
  }

  // --- 綁定按鈕事件 ---
  $("navHome").onclick = () => showView("home");
  $("navLetters").onclick = () => showView("letters");
  $("navDraw").onclick = () => showView("draw");
  $("navMemory").onclick = () => showView("memory");
  $("enterLetters").onclick = () => showView("letters");
  $("enterDraw").onclick = () => showView("draw");
  $("enterMemory").onclick = () => showView("memory");
  $("goHome").onclick = () => showView("home");
  $("stopBtn").onclick = () => speechSynthesis.cancel();

  showView("home");
});
