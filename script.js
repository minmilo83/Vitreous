// --- 1. 設定與資料 ---
// 這裡就是你的「書架」，之後在 GitHub 新增圖片後，記得回來這裡補上檔名
const DRAW_DATA = {
    menu: ['menu1.svg', 'menu2.svg', 'menu3.svg'], // 請替換成你實際的檔名
    restaurant: ['res1.svg', 'res2.svg', 'res3.svg'],
    price: ['100.svg', '200.svg', '500.svg'],
    count: ['1.svg', '2.svg', '3.svg'],
    drink: ['drink1.svg', 'drink2.svg', 'drink3.svg'],
    decision: {
        think: 'think.svg', // 思考時的圖片
        options: ['yes.svg', 'no.svg'] // 結果圖片
    }
};

// --- 2. 深淺模式切換 ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 初始化模式
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// --- 3. 畫面導覽邏輯 ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');

    homeScreen.classList.add('hidden');
    drawScreen.classList.remove('hidden');
    resultText.innerText = ""; // 清空上次結果

    if (type === 'decision') {
        runDecisionLogic();
    } else {
        runSlotLogic(type);
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('draw-screen').classList.add('hidden');
}

// --- 4. 拉霸核心演算法 (由慢到快再到慢) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    
    // 隨機決定總轉動時間 (2-3秒)
    const totalDuration = Math.random() * 1000 + 2000; 
    let elapsed = 0;
    let delay = 100; // 起始延遲
    
    slotImg.classList.add('spinning');

    // 動態循環切換圖片
    while (elapsed < totalDuration) {
        const randomIndex = Math.floor(Math.random() * items.length);
        slotImg.src = `assets/${type}/${items[randomIndex]}`;
        
        // 模擬「慢 -> 快 -> 慢」的速度曲線
        const progress = elapsed / totalDuration;
        if (progress < 0.2) delay -= 5;      // 加速期
        else if (progress > 0.7) delay += 15; // 減速期
        else delay = 30;                     // 巔峰期 (最快)

        await new Promise(resolve => setTimeout(resolve, delay));
        elapsed += delay;
    }

    // 最終定格結果
    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
}

// --- 5. 「要/不要」特殊 THINK 邏輯 ---
async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    // 先顯示 THINK 圖片
    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transform = "scale(1.1)"; // 輕微脈動效果
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 思考 2 秒

    // 隨機結果
    const finalResult = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${finalResult}`;
    slotImg.style.transform = "scale(1)";
    resultText.innerText = "這是您的結果";
}
