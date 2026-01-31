document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // --- 1. 元素定義 ---
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

  // --- 2. 視圖切換邏輯 ---
  function showView(target) {
    // 隱藏所有視圖並移除導航按鈕的 active 狀態
    Object.values(views).forEach(v => v?.classList.add("hidden"));
    Object.values(navBtns).forEach(b => b?.classList.remove("active"));
    
    // 顯示目標視圖
    if (views[target]) {
      views[target].classList.remove("hidden");
    }
    if (navBtns[target]) {
      navBtns[target].classList.add("active");
    }
    
    // 控制頂部工具列顯示 (Speed 與 Stop)
    const isAudioView = (target === "letters" || target === "memory" || target === "draw");
    $("speedWrap").classList.toggle("hidden", !isAudioView);
    $("stopBtn").classList.toggle("hidden", target !== "letters");

    // 初始化特定視圖
    if (target === "letters") renderLetters();
    if (target === "memory") renderMemoryPick();
    
    // 切換視圖時停止所有語音
    speechSynthesis.cancel();
  }

  // --- 3. 字母發音系統 ---
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let selectedLetters = new Set(letters.slice(0, 8)); // 預設選前 8 個

  function renderLetters() {
    const pickGrid = $("pickGrid");
    const playGrid = $("playGrid");
    if (!pickGrid || !playGrid) return;

    pickGrid.innerHTML = "";
    playGrid.innerHTML = "";

    // 渲染勾選區
    letters.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = `nav-btn ${selectedLetters.has(ch) ? 'active' : ''}`;
      btn.style.margin = "2px";
      btn.textContent = ch.toUpperCase();
      btn.onclick = () => {
        if (selectedLetters.has(ch)) selectedLetters.delete(ch);
        else selectedLetters.add(ch);
        renderLetters(); // 重新渲染
      };
      pickGrid.appendChild(btn);
    });

    // 渲染播放區
    [...selectedLetters].sort().forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "feature-card";
      btn.style.textAlign = "center";
      btn.innerHTML = `<div class="feature-title">${ch.toUpperCase()} ${ch}</div>`;
      btn.onclick = () => {
        const audio = new Audio(`audio/${ch}.mp3`);
        audio.playbackRate = $("rate").value;
        audio.play().catch(() => speak(ch)); // 沒音檔就用 TTS
      };
      playGrid.appendChild(btn);
    });
  }

  // --- 4. 語音功能 (TTS) ---
  function speak(text) {
    speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.rate = parseFloat($("rate").value);
    uttr.lang = "en-US";
    speechSynthesis.speak(uttr);
  }

  // --- 5. 比手畫腳抽籤 ---
  let words = [];
  $("loadWords").onclick = () => {
    const input = $("wordInput").value;
    words = input.split(/[\n,]/).map(w => w.trim()).filter(Boolean);
    alert(`成功載入 ${words.length} 個單字！`);
  };

  $("drawBtn").onclick = () => {
    if (words.length === 0) {
      alert("請先在上方輸入單字並點擊「加入清單」");
      return;
    }
    const idx = Math.floor(Math.random() * words.length);
    const pickedWord = words[idx];
    $("drawResult").textContent = pickedWord;
    speak(pickedWord);
  };

  // --- 6. 記憶翻牌遊戲 ---
  const memoryData = [
    { word: "Apple", img: "images/memory/apple.jpg" },
    { word: "Ant", img: "images/memory/ant.jpg" },
    { word: "Bee", img: "images/memory/bee.jpg" },
    { word: "Cat", img: "images/memory/cat.jpg" },
    { word: "Dog", img: "images/memory/dog.jpg" },
    { word: "Egg", img: "images/memory/egg.jpg" }
  ];
  let chosenMemory = [];

  function renderMemoryPick() {
    const grid = $("memoryPickGrid");
    if (!grid) return;
    grid.innerHTML = "";
    
    memoryData.forEach(item => {
      const isSelected = chosenMemory.some(c => c.word === item.word);
      const btn = document.createElement("button");
      btn.className = `nav-btn ${isSelected ? 'active' : ''}`;
      btn.textContent = item.word;
      btn.onclick = () => {
        if (isSelected) {
          chosenMemory = chosenMemory.filter(c => c.word !== item.word);
        } else if (chosenMemory.length < 4) {
          chosenMemory.push(item);
        }
        
        if (chosenMemory.length === 4) {
          $("memoryStatus").textContent = "已選滿 4 個，遊戲開始！";
          startMemoryGame();
        } else {
          $("memoryStatus").textContent = `還需要選擇 ${4 - chosenMemory.length} 個單字`;
          renderMemoryPick();
        }
      };
      grid.appendChild(btn);
    });
  }

  function startMemoryGame() {
    const gameGrid = $("memoryGameGrid");
    if (!gameGrid) return;
    gameGrid.innerHTML = "";

    let cards = [];
    chosenMemory.forEach(item => {
      cards.push({ ...item, type: 'img' });
      cards.push({ ...item, type: 'word' });
    });
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((data) => {
      const card = document.createElement("div");
      card.className = "feature-card"; 
      card.style.height = "100px";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.justifyContent = "center";
      card.style.backgroundColor = "#2b2b2b";
      card.style.color = "white";
      card.textContent = "?";

      card.onclick = () => {
        if (card.textContent !== "?") return; // 防止重複點擊
        
        if (data.type === 'img') {
          card.innerHTML = `<img src="${data.img}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
          card.textContent = data.word;
          card.style.backgroundColor = "white";
          card.style.color = "black";
        }
        
        // 這裡可以後續補強配對檢查邏輯
        speak(data.word);
      };
      gameGrid.appendChild(card);
    });
  }

  // --- 7. 事件綁定 (核心按鈕) ---
  $("navHome").onclick = () => showView("home");
  $("navLetters").onclick = () => showView("letters");
  $("navDraw").onclick = () => showView("draw");
  $("navMemory").onclick = () => showView("memory");

  $("enterLetters").onclick = () => showView("letters");
  $("enterDraw").onclick = () => showView("draw");
  $("enterMemory").onclick = () => showView("memory");
  
  $("goHome").onclick = () => showView("home");
  $("stopBtn").onclick = () => speechSynthesis.cancel();

  // 初始化首頁
  showView("home");
});
