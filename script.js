window.onload = function() {
    const $ = (id) => document.getElementById(id);

    // --- 資料定義 ---
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
        { word: "fox", img: "images/memory/fox.jpg" }
    ];

    // --- 系統狀態 ---
    let chosenWords = [];
    let flippedCards = [];
    const targetCount = 6; // 固定選 6 個

    // --- 視圖管理 ---
    function showView(targetId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        $(targetId).classList.remove('hidden');
        
        // 更新導覽按鈕狀態
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === 'nav' + targetId.replace('View',''));
        });

        // 初始化內容
        if(targetId === 'lettersView') renderLetters();
        if(targetId === 'memoryView') renderMemorySelector();
    }

    // --- 1. 字母練習 ---
    let selectedLetters = new Set(['a','b','c','d']);
    function renderLetters() {
        const pick = $("pickGrid"), play = $("playGrid");
        pick.innerHTML = ""; play.innerHTML = "";
        "abcdefghijklmnopqrstuvwxyz".split("").forEach(l => {
            const b = document.createElement("button");
            b.className = `nav-btn ${selectedLetters.has(l) ? 'active' : ''}`;
            b.innerText = l.toUpperCase();
            b.onclick = () => {
                selectedLetters.has(l) ? selectedLetters.delete(l) : selectedLetters.add(l);
                renderLetters();
            };
            pick.appendChild(b);
        });
        [...selectedLetters].sort().forEach(l => {
            const b = document.createElement("div");
            b.className = "select-item active"; b.innerText = l.toUpperCase();
            b.onclick = () => speak(l);
            play.appendChild(b);
        });
    }

    // --- 2. 抽籤系統 ---
    let drawPool = [];
    $("loadWords").onclick = () => {
        drawPool = $("wordInput").value.split(/[\n,]/).map(w => w.trim()).filter(Boolean);
        alert(`成功載入 ${drawPool.length} 個單字`);
    };
    $("drawBtn").onclick = () => {
        if(drawPool.length === 0) return alert("請先輸入單字");
        const res = drawPool[Math.floor(Math.random() * drawPool.length)];
        $("drawResult").innerText = res;
        speak(res);
    };

    // --- 3. 記憶遊戲選取器 ---
    function renderMemorySelector() {
        const grid = $("memoryPickGrid");
        const status = $("memoryStatus");
        grid.innerHTML = "";
        $("gameContainer").classList.add('hidden');

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

    // --- 4. 翻牌遊戲核心 ---
    function startMemoryGame() {
        $("gameContainer").classList.remove('hidden');
        const grid = $("memoryGameGrid");
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
                    if(flippedCards.length === 2) checkMatch();
                }
            };
            grid.appendChild(card);
        });
        $("gameContainer").scrollIntoView({behavior: 'smooth'});
    }

    function checkMatch() {
        const [c1, c2] = flippedCards;
        if(c1.data.word === c2.data.word) {
            speak(c1.data.word);
            setTimeout(() => {
                c1.el.classList.add('matched');
                c2.el.classList.add('matched');
                flippedCards = [];
            }, 600);
        } else {
            setTimeout(() => {
                c1.el.classList.remove('flipped');
                c2.el.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    function speak(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = parseFloat($("rate").value);
        speechSynthesis.speak(u);
    }

    // --- 基礎事件綁定 ---
    $("navHome").onclick = () => showView('homeView');
    $("navLetters").onclick = () => showView('lettersView');
    $("navDraw").onclick = () => showView('drawView');
    $("navMemory").onclick = () => showView('memoryView');
    $("enterLetters").onclick = () => showView('lettersView');
    $("enterDraw").onclick = () => showView('drawView');
    $("enterMemory").onclick = () => showView('memoryView');
    $("goHome").onclick = () => showView('homeView');

    showView('homeView');
};
