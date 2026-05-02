/**
 * Vitreous - 瑩透抽籤決定器
 * 核心功能：PWA 控制、變速拉霸演算法、THINK 儀式感、自動除錯路徑
 */

// --- 1. 資料配置 ---
// 注意：資料夾名稱需與 GitHub 倉庫完全一致 (大小寫敏感)
const DRAW_DATA = {
    menu: ['pasta.svg', 'ramen.svg', 'rice.svg', 'hotpot.svg'], 
    restaurant: ['store_a.svg', 'store_b.svg', 'store_c.svg'],
    price: ['price_100.svg', 'price_200.svg', 'price_500.svg'],
    count: ['count_1.svg', 'count_2.svg', 'count_3.svg', 'count_4.svg'],
    decision: {
        think: 'think.svg',      
        options: ['yes.svg', 'no.svg'] 
    }
};

// 飲料店專屬資料 (路徑已包含 assets/Tea-Shop/)
const drinkOptions = [
    { id: 'starbucks',  name: '星巴克',        img: 'assets/Tea-Shop/starbucks.svg' },
    { id: 'yimuji',     name: '一沐日',        img: 'assets/Tea-Shop/yimuji.svg' },
    { id: 'dayungs',    name: '大苑子',        img: 'assets/Tea-Shop/dayungs.svg' },
    { id: 'wutong',     name: '五桐號',        img: 'assets/Tea-Shop/wutong.svg' },
    { id: 'kebuke',     name: '可不可',        img: 'assets/Tea-Shop/kebuke.svg' },
    { id: 'sfc',        name: '鮮茶道',        img: 'assets/Tea-Shop/sfc.svg' },
    { id: '50lan',      name: '50嵐',          img: 'assets/Tea-Shop/50lan.svg' },
    { id: 'coco',       name: 'CoCo都可',      img: 'assets/Tea-Shop/coco.svg' },
    { id: 'louisa',     name: '路易莎',        img: 'assets/Tea-Shop/louisa.svg' },
    { id: 'tea-magic',  name: '茶の魔手',      img: 'assets/Tea-Shop/tea-magic.svg' },
    { id: 'tea-water',  name: '茶湯會',        img: 'assets/Tea-Shop/tea-water.svg' },
    { id: 'milksha',    name: '迷客夏',        img: 'assets/Tea-Shop/milksha.svg' },
    { id: 'ching-shin', name: '清心福全',      img: 'assets/Tea-Shop/ching-shin.svg' },
    { id: 'macu',       name: '麻古茶坊',      img: 'assets/Tea-Shop/macu.svg' },
    { id: 'guiji',      name: '龜記茗品',      img: 'assets/Tea-Shop/guiji.svg' },
    { id: 'tao-tao',    name: '先喝道',        img: 'assets/Tea-Shop/tao-tao.svg' },
    { id: 'nap-tea',    name: '再睡5分鐘',     img: 'assets/Tea-Shop/nap-tea.svg' },
    { id: 'truedan',    name: '珍煮丹',        img: 'assets/Tea-Shop/truedan.svg' },
    { id: 'dont-eat',   name: '今天休息',      img: 'assets/Tea-Shop/dont-eat.svg' },
    { id: 'try-again',  name: '再抽一次',      img: 'assets/Tea-Shop/try-again.svg' }
];

// --- 2. 導航與介面切換 ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    // 介面切換
    homeScreen.classList.add('hidden');[cite: 2]
    drawScreen.classList.remove('hidden');[cite: 2]
    
    // 初始化狀態，避免看到上一輪的結果
    resultText.innerText = "準備中...";[cite: 2]
    slotImg.style.transform = "scale(1)";[cite: 2]
    slotImg.classList.remove('spinning');

    // 根據 type 執行對應邏輯
    if (type === 'decision') {
        runDecisionLogic();[cite: 2]
    } else if (type === 'tea-shop' || type === 'drink') {
        // 同時相容兩種叫法，確保 index.html 不管寫哪個都能跑
        runTeaShopLogic();[cite: 2]
    } else {
        runSlotLogic(type);[cite: 2]
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');[cite: 2]
    document.getElementById('draw-screen').classList.add('hidden');[cite: 2]
}

// --- 3. 核心拉霸演算法 (飲料店) ---
async function runTeaShopLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    
    const totalDuration = 2500; // 固定轉動約 2.5 秒
    let elapsed = 0;
    let delay = 100; 
    
    slotImg.classList.add('spinning');[cite: 2, 3]
    let currentOption = drinkOptions[0];

    while (elapsed < totalDuration) {
        currentOption = drinkOptions[Math.floor(Math.random() * drinkOptions.length)];
        slotImg.src = currentOption.img;[cite: 2]
        resultText.innerText = "挑選中...";

        // 變速曲線邏輯
        const progress = elapsed / totalDuration;
        if (progress < 0.2) delay = 80;       // 加速階段
        else if (progress > 0.7) delay += 30; // 減速階段
        else delay = 50;                     // 穩定高速階段

        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');[cite: 3]
    
    // 結算文字
    if (currentOption.id === 'try-again') {
        resultText.innerText = "運氣不錯，再抽一次吧！";[cite: 2]
    } else if (currentOption.id === 'dont-eat') {
        resultText.innerText = "今天休息，喝水就好！";[cite: 2]
    } else {
        resultText.innerText = `今天喝：${currentOption.name}`;[cite: 2]
    }
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);[cite: 2]
}

// --- 4. 基礎拉霸演算法 (菜單、餐廳等) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    
    if(!items) {
        console.error("找不到對應的資料類型:", type);
        return;
    }
    
    slotImg.classList.add('spinning');
    let elapsed = 0;
    const totalDuration = 2000;
    let delay = 100;

    while (elapsed < totalDuration) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        // 修正路徑拼接：assets/類型/檔名
        slotImg.src = `assets/${type}/${randomItem}`;[cite: 2]
        
        const progress = elapsed / totalDuration;
        delay = progress > 0.8 ? delay + 40 : 60;

        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
    if (navigator.vibrate) navigator.vibrate(50);[cite: 2]
}

// --- 5. THINK 儀式感邏輯 ---
async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    // 進入思考狀態：縮放效果
    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 1.5s ease-in-out";
    slotImg.style.transform = "scale(1.2)"; 
    resultText.innerText = "思考中...";
    
    await new Promise(r => setTimeout(r, 1500)); 

    // 彈出結果
    const final = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${final}`;
    slotImg.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    slotImg.style.transform = "scale(1)"; 
    resultText.innerText = "決定了！";
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);[cite: 2]
}

// --- 6. PWA 與 主題控制 ---
// 深淺模式切換
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');[cite: 2]
        document.body.classList.toggle('light-mode', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}
// 載入存儲的主題
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme === 'dark' ? 'dark-mode' : 'light-mode');[cite: 2, 3]

// PWA 安裝按鈕
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('install-app');
    if(btn) btn.classList.remove('hidden');[cite: 2]
});

// Service Worker 註冊
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));[cite: 2]
}
