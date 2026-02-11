window.onload = function() {
    const $ = (id) => document.getElementById(id);

    // --- 1. 單字資料庫 ---
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

    // --- 2. 字母發音功能 ---
    let selectedLetters = new Set(['a','b','c','d']); 
    const audioCache = {};

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
            if (!audioCache[l]) {
                const audio = new Audio(`audio/${l}.mp3`);
                audio.preload = "auto";
                audioCache[l] = audio;
            }
        });
    }

    function playLetterAudio(l) {
        let audio = audioCache[l] || new Audio(`audio/${l}.mp3`);
        audio.playbackRate = $("rate") ? $("rate").value : 1;
        audio.currentTime = 0;
        audio.play().catch(() => speak(l));
    }

    function speak(text) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = $("rate") ? $("rate").value : 1;
        speechSynthesis.speak(u);
    }

    // --- 3. 記憶遊戲邏輯 ---
    let chosenWords = [];
    let flippedCards = [];
    const targetCount = 6;

    function renderMemorySelector() {
        const grid = $("memoryPickGrid");
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
        startBtn.innerText = chosenWords.length === targetCount ? "🎮 開始挑戰" : `請選滿 ${targetCount} 個 (${chosenWords.length}/${targetCount})`;
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
                            setTimeout(() => { c1.el.classList.remove('flipped'); c2.el.classList.remove('flipped'); flippedCards = []; }, 1000);
                        }
                    }
                }
            };
            grid.appendChild(card);
        });
    }

    // --- 4. 視圖管理與綁定 ---
    function showView(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const target = $(id);
        if (target) {
            target.classList.remove('hidden');
            if(id === 'lettersView') renderLetters();
            if(id === 'memoryView') renderMemorySelector();
        }
    }

    const bindings = [
        {id: "navHome", view: "homeView"}, {id: "navLetters", view: "lettersView"},
        {id: "navMemory", view: "memoryView"}, {id: "enterLetters", view: "lettersView"},
        {id: "enterMemory", view: "memoryView"}, {id: "goHome", view: "homeView"}
    ];

    bindings.forEach(item => {
        const el = $(item.id);
        if (el) el.onclick = () => showView(item.view);
    });

    showView('homeView');
}; // <-- 這裡非常重要，一定要包含這個結尾！
