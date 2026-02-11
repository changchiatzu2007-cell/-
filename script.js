window.onload = function() {
    // 簡易選擇器
    const $ = (id) => document.getElementById(id);

    // 1. 22 個單字清單
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

    // 2. 字母發音
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
            b.innerText = `${l.toUpperCase()} ${l}`;
            b.onclick = () => {
                const audio = audioCache[l] || new Audio(`audio/${l}.mp3`);
                audio.playbackRate = $("rate") ? $("rate").value : 1;
                audio.currentTime = 0;
                audio.play().catch(() => {
                    const u = new SpeechSynthesisUtterance(l);
                    u.lang = 'en-US';
                    speechSynthesis.speak(u);
                });
                audioCache[l] = audio;
            };
            play.appendChild(b);
        });
    }

    // 3. 翻牌遊戲選取與開始
    let chosenWords = [];
    let flippedCards = [];

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
                if(isSelected) chosenWords = chosenWords.filter(c => c.word !== item.word);
                else if(chosenWords.length < 6) chosenWords.push(item);
                renderMemorySelector();
            };
            grid.appendChild(div);
        });
        const btn = document.createElement("button");
        btn.className = `start-btn ${chosenWords.length === 6 ? 'ready' : ''}`;
        btn.innerText = chosenWords.length === 6 ? "🎮 開始" : `選 6 個單字 (${chosenWords.length}/6)`;
        btn.onclick = () => { if(chosenWords.length === 6) startMemoryGame(); };
        grid.appendChild(btn);
    }

    function startMemoryGame() {
        $("gameContainer")?.classList.remove('hidden');
        const grid = $("memoryGameGrid");
        if (!grid) return;
        grid.innerHTML = "";
        let deck = [...chosenWords.map(c=>({...c,type:'txt'})), ...chosenWords.map(c=>({...c,type:'img'}))];
        deck.sort(() => Math.random() - 0.5);
        deck.forEach(data => {
            const card = document.createElement("div");
            card.className = "memory-card";
            card.innerHTML = `<div class="memory-inner"><div class="face back">?</div><div class="face front">
                ${data.type === 'img' ? `<img src="${data.img}" onerror="this.src='https://via.placeholder.com/100?text=${data.word}'">` : `<span>${data.word}</span>`}
            </div></div>`;
            card.onclick = () => {
                if(flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    flippedCards.push({el: card, data: data});
                    if(flippedCards.length === 2) {
                        const [c1, c2] = flippedCards;
                        if(c1.data.word === c2.data.word) {
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

    // 4. 基礎導航
    function showView(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        $(id)?.classList.remove('hidden');
        if(id === 'lettersView') renderLetters();
        if(id === 'memoryView') renderMemorySelector();
    }

    const navs = ["navHome","navLetters","navMemory","enterLetters","enterMemory","goHome"];
    navs.forEach(id => { if($(id)) $(id).onclick = () => showView(id.replace('nav','').replace('enter','').toLowerCase() + 'View'); });

    showView('homeView');
};
