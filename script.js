window.onload = function() {
    console.log("系統已啟動");

    const $ = (id) => document.getElementById(id);

    // 視圖切換
    const views = ["homeView", "lettersView", "drawView", "memoryView"];
    
    function showView(targetId) {
        console.log("切換到: " + targetId);
        views.forEach(v => $(v).classList.add("hidden"));
        $(targetId).classList.remove("hidden");
        
        // 控制工具列顯示
        $("speedWrap").classList.toggle("hidden", targetId === "homeView");
        
        if(targetId === "lettersView") renderLetters();
        if(targetId === "memoryView") renderMemoryPick();
    }

    // --- 字母邏輯 ---
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    let selected = new Set(["a","b","c","d"]);

    function renderLetters() {
        const pick = $("pickGrid");
        const play = $("playGrid");
        pick.innerHTML = ""; play.innerHTML = "";

        letters.forEach(l => {
            const b = document.createElement("button");
            b.className = `nav-btn ${selected.has(l) ? 'active' : ''}`;
            b.innerText = l.toUpperCase();
            b.onclick = () => { selected.has(l) ? selected.delete(l) : selected.add(l); renderLetters(); };
            pick.appendChild(b);
        });

        [...selected].forEach(l => {
            const b = document.createElement("button");
            b.className = "card";
            b.innerText = l.toUpperCase();
            b.onclick = () => {
                const u = new SpeechSynthesisUtterance(l);
                u.rate = $("rate").value;
                speechSynthesis.speak(u);
            };
            play.appendChild(b);
        });
    }

    // --- 比手畫腳 ---
    let pool = [];
    $("loadWords").onclick = () => {
        pool = $("wordInput").value.split(/[\n,]/).map(w => w.trim()).filter(Boolean);
        alert("載入成功，共 " + pool.length + " 個");
    };
    $("drawBtn").onclick = () => {
        if(!pool.length) return alert("請先輸入單字");
        const res = pool[Math.floor(Math.random() * pool.length)];
        $("drawResult").innerText = res;
        const u = new SpeechSynthesisUtterance(res);
        u.rate = $("rate").value;
        speechSynthesis.speak(u);
    };

    // --- 記憶遊戲 ---
    let chosen = [];
    const memoryData = [
        {w:"Apple", i:"https://picsum.photos/100/100?random=1"},
        {w:"Banana", i:"https://picsum.photos/100/100?random=2"},
        {w:"Cat", i:"https://picsum.photos/100/100?random=3"},
        {w:"Dog", i:"https://picsum.photos/100/100?random=4"}
    ];

    function renderMemoryPick() {
        const grid = $("memoryPickGrid");
        grid.innerHTML = "";
        memoryData.forEach(item => {
            const b = document.createElement("button");
            b.className = "nav-btn";
            b.innerText = item.w;
            b.onclick = () => {
                if(chosen.length < 4) {
                    chosen.push(item);
                    if(chosen.length === 4) startMemory();
                }
            };
            grid.appendChild(b);
        });
    }

    function startMemory() {
        const grid = $("memoryGameGrid");
        grid.innerHTML = "";
        let cards = [...chosen.map(c=>({v:c.w, type:'t'})), ...chosen.map(c=>({v:c.i, type:'i', w:c.w}))];
        cards.sort(() => Math.random() - 0.5);

        cards.forEach(c => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.height = "80px";
            div.innerText = "?";
            div.onclick = () => {
                if(c.type === 't') div.innerText = c.v;
                else div.innerHTML = `<img src="${c.v}" style="width:100%">`;
                const u = new SpeechSynthesisUtterance(c.w || c.v);
                speechSynthesis.speak(u);
            };
            grid.appendChild(div);
        });
        chosen = [];
    }

    // 綁定所有導覽按鈕
    $("navHome").onclick = () => showView("homeView");
    $("navLetters").onclick = () => showView("lettersView");
    $("navDraw").onclick = () => showView("drawView");
    $("navMemory").onclick = () => showView("memoryView");
    $("enterLetters").onclick = () => showView("lettersView");
    $("enterDraw").onclick = () => showView("drawView");
    $("enterMemory").onclick = () => showView("memoryView");
    $("goHome").onclick = () => showView("homeView");
    $("stopBtn").onclick = () => speechSynthesis.cancel();
};
