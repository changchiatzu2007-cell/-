window.onload = function() {
    const $ = (id) => document.getElementById(id);

    // --- 1. 資料定義 (22個單字) ---
    const memoryWords = [
        { word: "ham", img: "images/memory/ham.jpg" }, { word: "jam", img: "images/memory/jam.jpg" },
        { word: "ant", img: "images/memory/ant.jpg" }, { word: "fan", img: "images/memory/fan.jpg" },
        { word: "pan", img: "images/memory/pan.jpg" }, { word: "van", img: "images/memory/van.jpg" },
        { word: "angry", img: "images/memory/angry.jpg" }, { word: "key", img: "images/memory/key.jpg" },
        { word: "monkey", img: "images/memory/monkey.jpg" }, { word: "green", img: "images/memory/green.jpg" },
        { word: "queen", img: "images/memory/queen.jpg" }, { word: "three", img: "images/memory/three.jpg" },
        { word: "igloo", img: "images/memory/igloo.jpg" }, { word: "zoo", img: "images/memory/zoo.jpg" },
        { word: "hungry", img: "images/memory/hungry.jpg" }, { word: "this", img: "images/memory/this.jpg" },
        { word: "that", img: "images/memory/that.jpg" }, { word: "thirsty", img: "images/memory/thirsty.jpg" },
        { word: "pig", img: "images/memory/pig.jpg" }, { word: "wig", img: "images/memory/wig.jpg" },
        { word: "ox", img: "images/memory/ox.jpg" }, { word: "fox", img: "images/memory/fox.jpg" }
    ];

    // --- 2. 字母發音優化 (加入預載緩存) ---
    let selectedLetters = new Set(['a','b','c','d']); 
    const audioCache = {}; // 用來存放預載好的 Audio 物件

    function renderLetters() {
        const pick = $("pickGrid"), play = $("playGrid");
        if (!pick || !play) return;
        pick.innerHTML = ""; play.innerHTML = "";

        "abcdefghijklmnopqrstuvwxyz".split("").forEach(l => {
            const b = document.createElement("button");
            b.className = `nav-btn ${selectedLetters.has(l) ? 'active' : ''}`;
            b.innerText = `${l.toUpperCase()} ${l}`;
            b.onclick = () => {
                selectedLetters.has(l) ? selectedLetters.delete(l) : selectedLetters.add(l);
                if (selectedLetters.has(l)) preloadAudio(l); // 勾選時立即預載
                renderLetters();
            };
            pick.appendChild(b);
        });

        [...selectedLetters].sort().forEach(l => {
            const b = document.createElement("div");
            b.className = "select-item active"; 
            b.style.fontSize = "1.5rem";
            b.innerText = `${l.toUpperCase()} ${l}`;
            b.onclick = () => playLetterAudio(l);
            play.appendChild(b);
            preloadAudio(l); // 渲染播放按鈕時也確保預載
        });
    }

    // 預載音檔函式
    function preloadAudio(letter) {
        if (!audioCache[letter]) {
            const audio = new Audio(`audio/${letter}.mp3`);
            audio.preload = "auto"; // 強制瀏覽器儘早下載
            audioCache[letter] = audio;
        }
    }

    // 播放音檔 (優化：重置播放時間以達到快速響應)
    function playLetterAudio(letter) {
        let audio = audioCache[letter];
        
        // 如果還沒載入，現場建立一個
        if (!audio) {
            audio = new Audio(`audio/${letter}.mp3`);
            audioCache[letter] = audio;
        }

        // 設定播放速率 (對應拉桿)
        const speed = $("rate") ? $("rate").value : 1;
        audio.playbackRate = speed;

        // 重要：如果音檔正在播，先拉回開頭，避免連點沒反應
        audio.currentTime = 0; 
        
        audio.play().catch(() => {
            console.log(`音檔播放失敗，切換至 TTS`);
            speak(letter); 
        });
    }

    // --- 3. 語音功能 (TTS) ---
    function speak(text) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = $("rate") ? $("rate").value : 1;
        speechSynthesis.speak(u);
    }

    // --- 4. 記憶遊戲邏輯 ---
    let chosenWords = [];
    let flippedCards = [];
    const targetCount = 6;

    function renderMemorySelector() {
        const grid = $("memoryPickGrid");
        const status = $("memoryStatus");
        if (!grid) return;
        grid.innerHTML = "";
        $("gameContainer")?.classList.add('hidden');

        memoryWords.forEach(item => {
            const isSelected = chosenWords.some(c => c.word === item.word);
            const div = document.createElement("div");
            div.className = `select-item ${isSelected ? 'active' : ''}`;
            div.innerText = item.word;
            div.onclick = () => {
                if(isSelected) {
                    chosenWords = chosenWords.filter(c => c.word !== item.word);
                } else if(chosenWords.length < targetCount) {
                    chosenWords.push(item);
                }
                renderMemorySelector();
            };
            grid.appendChild(div);
        });

        const startBtn = document.createElement("button");
        startBtn.className = `start-btn ${chosenWords.length === targetCount ? 'ready' : ''}`;
        startBtn.innerText = chosenWords.length === targetCount ? "🎮 開始翻牌挑戰" : `請選滿 ${targetCount} 個 (${chosenWords.length}/${targetCount})`;
        startBtn.onclick = () => { if(chosenWords.length === targetCount) startMemoryGame(); };
        grid.appendChild(startBtn);
    }

    function startMemoryGame() {
        $("gameContainer")?.classList.remove('hidden');
        const grid = $("memoryGameGrid");
        if (!grid) return;
        grid.innerHTML = "";
        let deck = [
            ...chosenWords.map(c => ({...c, display: c.word, type: 'text'})),
            ...chosenWords.map(c => ({...c, display: c.img, type: 'img'}))
        ];
        deck.sort(() => Math.random() - 0.5);
        deck.forEach(data => {
            const card = document.createElement("div");
            card.className = "memory-card";
            card.innerHTML = `<div class="memory-inner">
                <div class="face back">?</div>
                <div class="face front">${data.type === 'img' ? `<img src="${data.display}" onerror="this.src='https://via.placeholder.com/150?text=${data.word}'">` : `<span>${data.display}</span>`}</div>
            </div>`;
            card.onclick = () => {
                if(flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    flippedCards.push({el: card, data: data});
                    if(flippedCards.length === 2) {
                        const [c1, c2] = flippedCards;
                        if(c1.data.word === c2.data.word) {
                            speak(c1.data.word);
                            setTimeout(() => { c1.el.classList.add('matched'); c2.el.classList.add('matched'); flippedCards = []; }, 600);
                        } else {
