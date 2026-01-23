document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ===== Views =====
  const homeView = $("homeView");
  const lettersView = $("lettersView");
  const drawView = $("drawView");

  const navHome = $("navHome");
  const navLetters = $("navLetters");
  const navDraw = $("navDraw");
  const goHome = $("goHome");
  const enterLetters = $("enterLetters");
  const enterDraw = $("enterDraw");

  const speedWrap = $("speedWrap");
  const rateInput = $("rate");
  const stopBtn = $("stopBtn");

  // 防呆：如果 JS 沒有抓到關鍵元素，就在 console 顯示（不讓整支崩）
  const must = ["homeView","lettersView","drawView","navHome","navLetters","navDraw"];
  const missing = must.filter(id => !$(id));
  if (missing.length) {
    console.warn("[YL Learning] Missing elements:", missing);
  }

  function setNavActive(which) {
    [navHome, navLetters, navDraw].forEach(b => b?.classList.remove("active"));
    if (which === "home") navHome?.classList.add("active");
    if (which === "letters") navLetters?.classList.add("active");
    if (which === "draw") navDraw?.classList.add("active");
  }

  function showView(which) {
    homeView?.classList.add("hidden");
    lettersView?.classList.add("hidden");
    drawView?.classList.add("hidden");

    stopAllAudio();

    if (which === "home") {
      homeView?.classList.remove("hidden");
      speedWrap?.classList.add("hidden");
      stopBtn?.classList.add("hidden");
      setNavActive("home");
    }

    if (which === "letters") {
      lettersView?.classList.remove("hidden");
      speedWrap?.classList.remove("hidden");
      stopBtn?.classList.remove("hidden");
      setNavActive("letters");
      showLettersPanel("pick");
    }

    if (which === "draw") {
      drawView?.classList.remove("hidden");
      speedWrap?.classList.add("hidden");
      stopBtn?.classList.add("hidden");
      setNavActive("draw");
    }
  }

  // ===== Letters module =====
  const pickTab = $("pickTab");
  const playTab = $("playTab");
  const pickPanel = $("pickPanel");
  const playPanel = $("playPanel");
  const pickGrid = $("pickGrid");
  const playGrid = $("playGrid");

  const countEl = $("count");
  const warnEl = $("warn");
  const nowEl = $("now");

  const allBtn = $("allBtn");
  const noneBtn = $("noneBtn");
  const only10Btn = $("only10Btn");

  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
  const default10 = ["a","c","g","h","i","j","m","n","p","t"];

  let selected = new Set(loadSelected() ?? default10);

  // audio
  const audioPool = {};
  let currentAudio = null;

  function preloadAudio(list) {
    list.forEach(ch => {
      if (!audioPool[ch]) {
        const a = new Audio(`audio/${ch}.mp3`);
        a.preload = "auto";
        audioPool[ch] = a;
      }
    });
  }

  function updateCount() {
    if (countEl) countEl.textContent = String(selected.size);
  }

  function showLettersPanel(which) {
    if (which === "pick") {
      pickTab?.classList.add("active");
      playTab?.classList.remove("active");
      pickPanel?.classList.remove("hidden");
      playPanel?.classList.add("hidden");
      stopAllAudio();
      return;
    }

    if (selected.size === 0) {
      alert("至少選一個字母！");
      return;
    }

    pickTab?.classList.remove("active");
    playTab?.classList.add("active");
    pickPanel?.classList.add("hidden");
    playPanel?.classList.remove("hidden");

    const arr = [...selected].sort();
    preloadAudio(arr);
    renderPlay();
  }

  function renderPick() {
    if (!pickGrid) return;
    pickGrid.innerHTML = "";
    letters.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter";
      btn.innerHTML = `<div class="big">${ch.toUpperCase()}${ch}</div><div class="sub">選擇</div>`;
      btn.classList.toggle("selected", selected.has(ch));

      btn.addEventListener("click", () => {
        if (selected.has(ch)) selected.delete(ch);
        else selected.add(ch);
        btn.classList.toggle("selected", selected.has(ch));
        saveSelected([...selected].sort());
        updateCount();
      });

      pickGrid.appendChild(btn);
    });
    updateCount();
  }

  function renderPlay() {
    if (!playGrid) return;
    playGrid.innerHTML = "";

    const arr = [...selected].sort();
    if (warnEl) warnEl.textContent = `已載入 ${arr.length} 個字母：${arr.join(", ")}`;

    arr.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter";
      btn.innerHTML = `<div class="big">${ch.toUpperCase()}${ch}</div><div class="sub">播放</div>`;
      btn.addEventListener("click", () => playLetter(ch, btn));
      playGrid.appendChild(btn);
    });
  }

  function playLetter(letter, btn) {
    stopAllAudio();

    let audio = audioPool[letter];
    if (!audio) {
      audio = new Audio(`audio/${letter}.mp3`);
      audio.preload = "auto";
      audioPool[letter] = audio;
    }

    currentAudio = audio;
    audio.currentTime = 0;
    audio.playbackRate = Number(rateInput?.value ?? 1);

    if (nowEl) nowEl.textContent = `${letter.toUpperCase()}${letter}`;
    playGrid?.querySelectorAll(".letter").forEach(b => b.classList.remove("playing"));
    btn.classList.add("playing");

    audio.onerror = () => {
      alert(`找不到或無法播放：audio/${letter}.mp3\n請確認 audio 資料夾與檔名（小寫 a.mp3 ~ z.mp3）`);
      btn.classList.remove("playing");
      if (nowEl) nowEl.textContent = "（播放失敗）";
    };

    audio.onended = () => {
      btn.classList.remove("playing");
      if (nowEl) nowEl.textContent = `${letter.toUpperCase()}${letter}（播放完成）`;
    };

    audio.play().catch(() => {
      alert("手機/iPad 可能需要再點一次才允許播放聲音（系統限制）。");
      btn.classList.remove("playing");
    });
  }

  function stopAllAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    playGrid?.querySelectorAll(".letter").forEach(b => b.classList.remove("playing"));
    if (nowEl) nowEl.textContent = "（已停止）";
  }

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

  // events: letters
  pickTab?.addEventListener("click", () => showLettersPanel("pick"));
  playTab?.addEventListener("click", () => showLettersPanel("play"));
  allBtn?.addEventListener("click", () => {
    selected = new Set(letters);
    saveSelected([...selected].sort());
    renderPick();
  });
  noneBtn?.addEventListener("click", () => {
    selected = new Set();
    saveSelected([]);
    renderPick();
  });
  only10Btn?.addEventListener("click", () => {
    selected = new Set(default10);
    saveSelected([...selected].sort());
    renderPick();
  });
  stopBtn?.addEventListener("click", stopAllAudio);

  // ===== Draw module =====
  const wordInput = $("wordInput");
  const loadWordsBtn = $("loadWords");
  const drawBtn = $("drawBtn");
  const removePickedBtn = $("removePicked");
  const clearWordsBtn = $("clearWords");
  const drawResult = $("drawResult");
  const wordCount = $("wordCount");

  let words = [];
  let lastPickedIndex = -1;

  function updateWordCount() {
    if (wordCount) wordCount.textContent = String(words.length);
  }

  loadWordsBtn?.addEventListener("click", () => {
    const raw = wordInput?.value ?? "";
    words = raw
      .split(/[\n,]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
    lastPickedIndex = -1;
    removePickedBtn?.classList.add("hidden");
    if (drawResult) drawResult.textContent = "—";
    updateWordCount();
    alert(`已加入 ${words.length} 個詞`);
  });

  drawBtn?.addEventListener("click", () => {
    if (words.length === 0) {
      alert("所有詞都抽完了！");
      return;
    }
    lastPickedIndex = Math.floor(Math.random() * words.length);
    const pick = words[lastPickedIndex];
    if (drawResult) drawResult.textContent = pick;
    removePickedBtn?.classList.remove("hidden");
  });

  removePickedBtn?.addEventListener("click", () => {
    if (lastPickedIndex < 0) return;
    words.splice(lastPickedIndex, 1); // 移除避免重複
    lastPickedIndex = -1;
    if (drawResult) drawResult.textContent = "—";
    removePickedBtn.classList.add("hidden");
    updateWordCount();
    if (words.length === 0) alert("已全部抽完！");
  });

  clearWordsBtn?.addEventListener("click", () => {
    words = [];
    lastPickedIndex = -1;
    if (wordInput) wordInput.value = "";
    if (drawResult) drawResult.textContent = "—";
    removePickedBtn?.classList.add("hidden");
    updateWordCount();
  });

  // ===== Nav events =====
  navHome?.addEventListener("click", () => showView("home"));
  navLetters?.addEventListener("click", () => showView("letters"));
  navDraw?.addEventListener("click", () => showView("draw"));

  enterLetters?.addEventListener("click", () => showView("letters"));
  enterDraw?.addEventListener("click", () => showView("draw"));

  goHome?.addEventListener("click", () => showView("home"));
  goHome?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") showView("home");
  });

  // ===== Init =====
  renderPick();
  updateWordCount();
  showView("home");
});
