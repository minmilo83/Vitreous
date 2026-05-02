/**
 * Vitreous - 瑩透抽籤決定器
 * 功能：PWA 安裝控制、黑白模式切換、變速拉霸邏輯、THINK 儀式感
 */

// --- 1. 資料配置 ---
// 當你在 GitHub 儲存庫新增圖片後，請在此處更新檔名
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

// --- 2. PWA 手動安裝邏輯 ---
let deferredPrompt;
const installBtn = document.getElementById('install-app');

window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止瀏覽器自動彈出安裝提示
    e.preventDefault();
    // 暫存事件以供點擊按鈕時觸發
    deferredPrompt = e;
    // 顯示「下載 APP」按鈕
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install: ${outcome}`);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
    }
});

window.addEventListener('appinstalled', () => {
    console.log('Vitreous 已成功安裝');
    installBtn.classList.add('hidden');
});

// --- 3. 深淺模式切換 ---
const themeToggle = document.getElementById('theme-toggle');

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
};

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 初始化主題
applyTheme(localStorage.getItem('theme') || 'light');

// --- 4. 導航邏輯 ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    homeScreen.classList.add('hidden');
    drawScreen.classList.remove('hidden');
    resultText.innerText = ""; 
    slotImg.style.transform = "scale(1)";

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

// --- 5. 拉霸演算法 (由慢到快再到慢) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    
    // 隨機轉動總時間 2.0s - 3.0s
    const totalDuration = Math.floor(Math.random() * 1000) + 2000; 
    let elapsed = 0;
    let delay = 120; // 初始延遲 (ms)
    
    slotImg.classList.add('spinning');

    while (elapsed < totalDuration) {
        const randomIndex = Math.floor(Math.random() * items.length);
        slotImg.src = `assets/${type}/${items[randomIndex]}`;
        
        const progress = elapsed / totalDuration;
        // 變速曲線
        if (progress < 0.25) delay -= 8;      // 加速
        else if (progress > 0.7) delay += 25; // 減速
        else delay = 40;                     // 高速穩定

        delay = Math.max(30, Math.min(delay, 500)); // 限制範圍

        await new Promise(resolve => setTimeout(resolve, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
    
    if (navigator.vibrate) navigator.vibrate(50); // 結束震動回饋
}

// --- 6. 要/不要 THINK 邏輯 ---
async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    // 階段一：思考中 (THINK)
    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 2s ease-in-out";
    slotImg.style.transform = "scale(1.15)"; 
    
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    // 階段二：結果 (YES / NO)
    const finalResult = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${finalResult}`;
    slotImg.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    slotImg.style.transform = "scale(1)"; 
    
    resultText.innerText = "這是您的結果";
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// --- 7. Service Worker 註冊 ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker 已註冊'))
            .catch(err => console.log('Service Worker 註冊失敗', err));
    });
}
/**
 * 飲料店資料設定 (共 20 個選項)
 * 包含 18 家品牌店與 2 個特殊狀態
 */
const drinkOptions = [
    { id: 'starbucks',  name: '星巴克',        img: 'Tea-Shop/starbucks.svg' },
    { id: 'yimuji',     name: '一沐日',        img: 'Tea-Shop/yimuji.svg' },
    { id: 'dayungs',    name: '大苑子',        img: 'Tea-Shop/dayungs.svg' },
    { id: 'wutong',     name: '五桐號',        img: 'Tea-Shop/wutong.svg' },
    { id: 'kebuke',     name: '可不可',        img: 'Tea-Shop/kebuke.svg' },
    { id: 'sfc',        name: '鮮茶道',        img: 'Tea-Shop/sfc.svg' },
    { id: '50lan',      name: '50嵐',          img: 'Tea-Shop/50lan.svg' },
    { id: 'coco',       name: 'CoCo都可',      img: 'Tea-Shop/coco.svg' },
    { id: 'louisa',     name: '路易莎',        img: 'Tea-Shop/louisa.svg' },
    { id: 'tea-magic',  name: '茶の魔手',      img: 'Tea-Shop/tea-magic.svg' },
    { id: 'tea-water',  name: '茶湯會',        img: 'Tea-Shop/tea-water.svg' },
    { id: 'milksha',    name: '迷客夏',        img: 'Tea-Shop/milksha.svg' },
    { id: 'ching-shin', name: '清心福全',      img: 'Tea-Shop/ching-shin.svg' },
    { id: 'macu',       name: '麻古茶坊',      img: 'Tea-Shop/macu.svg' },
    { id: 'guiji',      name: '龜記茗品',      img: 'Tea-Shop/guiji.svg' },
    { id: 'tao-tao',    name: '先喝道',        img: 'Tea-Shop/tao-tao.svg' },
    { id: 'nap-tea',    name: '再睡5分鐘',     img: 'Tea-Shop/nap-tea.svg' },
    { id: 'truedan',    name: '珍煮丹',        img: 'Tea-Shop/truedan.svg' },
    { id: 'dont-eat',   name: '今天不要吃',    img: 'Tea-Shop/dont-eat.svg' },
    { id: 'try-again',  name: '再抽一次',      img: 'Tea-Shop/try-again.svg' }
];

/**
 * 隨機抽取 function
 */
function pickRandomDrink() {
    const randomIndex = Math.floor(Math.random() * drinkOptions.length);
    const selected = drinkOptions[randomIndex];
    
    // 輸出結果到控制台 (除錯用)
    console.log(`抽中 ID: ${selected.id} | 店名: ${selected.name}`);
    
    return selected;
}

/**
 * 渲染結果到畫面 (範例邏輯)
 * 假設你有一個 id="result-container" 的 div
 */
function displayResult() {
    const result = pickRandomDrink();
    const container = document.getElementById('result-container');
    
    if (container) {
        container.innerHTML = `
            <div class="result-card">
                <img src="${result.img}" alt="${result.name}" class="drink-logo">
                <h3>${result.name}</h3>
            </div>
        `;
    }
}

// 導出模組 (如果你有使用 ES6 模組化)
// export { drinkOptions, pickRandomDrink };
