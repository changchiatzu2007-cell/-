const grid = document.getElementById("grid");

// 只顯示這 10 個字母，並同時顯示大寫+小寫
const letters = ["a","c","g","h","i","j","m","n","p","t"];

letters.forEach(ch => {
  const btn = document.createElement("button");
  btn.className = "letter";
  btn.type = "button";

  const upper = ch.toUpperCase();
  btn.innerHTML = `
    <div class="big">${upper}${ch}</div>
    <div class="sub">phonics</div>
  `;

  btn.addEventListener("click", () => playSound(ch, btn));
  grid.appendChild(btn);
});

let currentAudio = null;

function playSound(letter, btn) {
  // 停掉上一個音，避免疊音
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const src = `audio/${letter}.mp3`; // 例如 audio/a.mp3
  const audio = new Audio(src);
  currentAudio = audio;

  // 播放失敗時提示（最常見：找不到檔案或副檔名不對）
  audio.onerror = () => {
    alert(`找不到或無法播放：${src}\n請確認 audio 資料夾與檔名是否正確（例如 a.mp3）`);
  };

  // 一點視覺回饋
  btn.classList.add("playing");
  audio.onended = () => btn.classList.remove("playing");

  audio.play().catch(() => {
    alert("瀏覽器阻擋自動播放：請再點一次按鈕，或改用 Chrome/Edge。");
    btn.classList.remove("playing");
  });
}
