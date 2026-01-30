document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // Views
  const homeView = $("homeView");
  const lettersView = $("lettersView");
  const drawView = $("drawView");
  const memoryView = $("memoryView");

  // Nav
  const navHome = $("navHome");
  const navLetters = $("navLetters");
  const navDraw = $("navDraw");
  const navMemory = $("navMemory");

  // Enter buttons
  const enterLetters = $("enterLetters");
  const enterDraw = $("enterDraw");
  const enterMemory = $("enterMemory");

  const goHome = $("goHome");
  const speedWrap = $("speedWrap");
  const stopBtn = $("stopBtn");

  function hideAllViews() {
    [homeView, lettersView, drawView, memoryView].forEach(v => v?.classList.add("hidden"));
  }

  function setNavActive(which) {
    [navHome, navLetters, navDraw, navMemory].forEach(b => b?.classList.remove("active"));
    if (which) {
      const btn = { home: navHome, letters: navLetters, draw: navDraw, memory: navMemory }[which];
      btn?.classList.add("active");
    }
  }

  function showView(which) {
    hideAllViews();
    stopAllAudio();

    if (which === "home") {
      homeView?.classList.remove("hidden");
      speedWrap?.classList.add("hidden");
      stopBtn?.classList.add("hidden");
    }

    if (which === "letters") {
      lettersView?.classList.remove("hidden");
      speedWrap?.classList.remove("hidden");
      stopBtn?.classList.remove("hidden");
      renderPick();
      renderPlay();
    }

    if (which === "draw") {
      drawView?.classList.remove("hidden");
      speedWrap?.classList.add("hidden");
      stopBtn?.classList.add("hidden");
    }

    if (which === "memory") {
      memoryView?.classList.remove("hidden");
      speedWrap?.classList.remove("hidden");
      stopBtn?.classList.add("hidden");
      renderMemoryPick();
    }

    setNavActive(which);
  }

  // =========================
  // Letters (MP3)
  // =========================
  const pickGrid = $("pickGrid");
  const playGrid = $("playGrid");
  const nowEl = $("now");

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let selectedLetters = new Set(letters.slice(0, 10));
  const audioPool = {};
  let currentAudio = null;

  function renderPick() {
    if (!pickGrid) return;
    pickGrid.innerHTML = "";

    letters.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "letter";
      btn.textContent = ch.toUpperCase();
      btn.classList.toggle("selected", selectedLetters.has(ch));

      btn.onclick = () => {
        if (selectedLetters.has(ch)) selectedLetters.delete(ch);
        else selectedLetters.add(ch);
        btn.classList.toggle("selected");
      };

      pickGrid.appendChild(btn);
    });
  }

  function renderPlay() {
    if (!playGrid) return;
    playGrid.innerHTML = "";

    [...selectedLetters].forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "letter";
      btn.textContent = ch.toUpperCase();
      btn.onclick = () => playLetterMP3(ch, btn);
      playGrid.appendChild(btn);
    });
  }

  function playLetterMP3(letter, btn) {
    stopAllAudio();

    let audio = audioPool[letter];
    if (!audio) {
      audio = new Audio(`audio/${letter}.mp3`);
      audioPool[letter] = audio;
    }

    currentAudio = audio;
    audio.currentTime = 0;
    audio.play();

    nowEl.textContent = letter.toUpperCase();
    btn.classList.add("playing");

    audio.onended = () => btn.classList.remove("playing");
  }

  function stopAllAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  // =========================
  // Browser TTS
  // =========================
  let ttsVoice = null;

  function initTTS() {
    const voices = speechSynthesis.getVoices();
    ttsVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
  }

  speechSynthesis.onvoiceschanged = initTTS;
  initTTS();

  function speak(text, rate = 1) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (ttsVoice) u.voice = ttsVoice;
    u.rate = rate;
    speechSynthesis.speak(u);
  }

  // =========================
  // Draw (抽籤)
  // =========================
  const wordInput = $("wordInput");
  const drawBtn = $("drawBtn");
  const removePickedBtn = $("removePicked");
  const drawResult = $("drawResult");

  let words = [];
  let lastPick = -1;

  $("loadWords")?.addEventListener("click", () => {
    words = (wordInput.value || "").split(/[\n,]/).map(w => w.trim()).filter(Boolean);
    alert(`已載入 ${words.length} 個詞`);
  });

  drawBtn?.addEventListener("click", () => {
    if (!words.length) return alert("沒有詞了！");
    lastPick = Math.floor(Math.random() * words.length);
    const pick = words[lastPick];
    drawResult.textContent = pick;
    speak(pick, 1);
    removePickedBtn.classList.remove("hidden");
  });

  removePickedBtn?.addEventListener("click", () => {
    if (lastPick < 0) return;
    words.splice(lastPick, 1);
    lastPick = -1;
    drawResult.textContent = "—";
    removePickedBtn.classList.add("hidden");
  });

  // =========================
  // Memory Game
  // =========================
  const memoryPickGrid = $("memoryPickGrid");

  const memoryWords = [
    { word: "ham", img: "images/memory/ham.jpg" },
    { word: "jam", img: "images/memory/jam.jpg" },
    { word: "ant", img: "images/memory/ant.jpg" },
    { word: "fan", img: "images/memory/fan.jpg" },
    { word: "pan", img: "images/memory/pan.jpg" }, 
    { word: "van", img: "images/memory/van.jpg" }, 
    { word: "angry", img: "images/memory/angry.jpg" }, 
    { word: "key", img: "images/memory/key.jpg" }, 
    { word: "monkey", img: "images/memory/monkey.jpg" }, 
    { word: "green", img: "images/memory/green.jpg" }, 
    { word: "queen", img: "images/memory/queen.jpg" }, 
    { word: "three", img: "images/memory/three.jpg" }, 
    { word: "igloo", img: "images/memory/igloo.jpg" }, 
    { word: "zoo", img: "images/memory/zoo.jpg" }, 
    { word: "hungry", img: "images/memory/hungry.jpg" }, 
    { word: "this", img: "images/memory/this.jpg" }, 
    { word: "that", img: "images/memory/that.jpg" }, 
    { word: "thirsty", img: "images/memory/thirsty.jpg" }, 
    { word: "pig", img: "images/memory/pig.jpg" }, 
    { word: "wig", img: "images/memory/wig.jpg" }, 
    { word: "ox", img: "images/memory/ox.jpg" }, 
    { word: "fox", img: "images/memory/fox.jpg" },
  ];

  let memorySelected = [];

  function renderMemoryPick() {
    if (!memoryPickGrid) return;
    memoryPickGrid.innerHTML = "";

    memoryWords.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "memory-pick";
      btn.textContent = item.word;
      btn.onclick = () => {
        btn.classList.toggle("selected");
        if (memorySelected.includes(item)) {
          memorySelected = memorySelected.filter(x => x !== item);
        } else {
          memorySelected.push(item);
        }
      };
      memoryPickGrid.appendChild(btn);
    });
  }

  // =========================
  // Nav Events
  // =========================
  navHome?.onclick = () => showView("home");
  navLetters?.onclick = () => showView("letters");
  navDraw?.onclick = () => showView("draw");
  navMemory?.onclick = () => showView("memory");

  enterLetters?.onclick = () => showView("letters");
  enterDraw?.onclick = () => showView("draw");
  enterMemory?.onclick = () => showView("memory");

  goHome?.onclick = () => showView("home");

  // =========================
  // Init
  // =========================
  showView("home");
});
