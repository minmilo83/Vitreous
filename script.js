/**
 * Vitreous - 瑩透抽籤決定器 核心邏輯
 * 採用 Vibe Coding 模式開發，支援 PWA 與 Liquid Glass UI
 */

// --- 1. 資料配置 (與 GitHub 上的 assets 目錄對應) ---
// 當你在 GitHub 資料夾新增圖片後，只需回來這裡把檔名加進去即可。
const DRAW_DATA = {
    menu: ['pasta.svg', 'ramen.svg', 'rice.svg', 'hotpot.svg'], 
    restaurant: ['store_a.svg', 'store_b.svg', 'store_c.svg'],
    price: ['price_100.svg', 'price_200.svg', 'price_500.svg'],
    count: ['count_1.svg', 'count_2.svg', 'count_3.svg', 'count_4.svg'],
    drink: ['tea.svg', 'coffee.svg', 'juice.svg'],
    decision: {
        think: 'think.svg',      // 思考中的過渡圖片
        options: ['yes.svg', 'no.svg'] // 最終結果圖片
    }
};

// --- 2. 深淺模式切換邏輯 ---
const themeToggle = document.getElementById('theme-toggle');

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }
};

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
});

initTheme();

// --- 3. 頁面導覽邏輯 ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    // 切換介面
    homeScreen.classList.add('hidden');
    drawScreen.classList.remove('hidden');
    resultText.innerText = ""; // 重置文字
    slotImg.style.transform = "scale(1)"; // 重置縮放

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

// --- 4. 核心拉霸演算法 (由慢到快再到慢) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    
    // 隨機決定總轉動時間 (2.0s - 3.0s 之間)
    const totalDuration = Math.floor(Math.random() * 1000) + 2000; 
    let elapsed = 0;
    let delay = 120; // 初始切換延遲 (ms)
    
    slotImg.classList.add('spinning');

    // 高頻率圖片切換迴圈
    while (elapsed < totalDuration) {
        // 隨機選取該分類下的一張圖片
        const randomIndex = Math.floor(Math.random() * items.length);
        slotImg.src = `assets/${type}/${items[randomIndex]}`;
        
        // 變速曲線控制 (由慢到快，再到極慢)
        const progress = elapsed / totalDuration;
        if (progress < 0.25) {
            delay -= 8; // 加速階段
        } else if (progress > 0.7) {
            delay += 25; // 減速階段
        } else {
            delay = 40; // 穩定高速階段
        }

        // 安全界限，防止 delay 過小或過大
        delay = Math.max(30, Math.min(delay, 500));

        await new Promise(resolve => setTimeout(resolve, delay));
        elapsed += delay;
    }

    // 結束動畫
    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
    
    // 手機端輕微震動回饋 (如果裝置支援)
    if (navigator.vibrate) navigator.vibrate(50);
}

// --- 5. 「要/不要」特殊 THINK 邏輯 ---
async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    // 1. 顯示 THINK 圖片 (思考階段)
    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 2s ease-in-out";
    slotImg.style.transform = "scale(1.15)"; // 慢速放大營造緊張感
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 固定思考 2 秒

    // 2. 顯示隨機結果 (YES 或 NO)
    const finalResult = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${finalResult}`;
    slotImg.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    slotImg.style.transform = "scale(1)"; // 彈回原大小
    
    resultText.innerText = "這是您的結果";
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// --- 6. PWA Service Worker 註冊 ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Vitreous PWA 就緒:', reg.scope))
            .catch(err => console.log('PWA 註冊失敗:', err));
    });
}
