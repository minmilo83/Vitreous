/**
 * Vitreous - 瑩透抽籤決定器 (完整功能整合版)
 * 1. 支援深淺色模式切換與持久化
 * 2. 飲料店變速拉霸邏輯 (帶入圖片與特殊結果回饋)
 * 3. 完整六大模塊抽籤功能 (包含 THINK 儀式感)
 * 4. PWA 安裝控制與震動回饋
 */

// --- 1. 資料庫配置 ---
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

// --- 2. 模式切換邏輯 (功能 1) ---
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

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}
applyTheme(localStorage.getItem('theme') || 'light');

// --- 3. 介面導航控制 (功能 4) ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    homeScreen.classList.add('hidden');
    drawScreen.classList.remove('hidden');
    
    // 初始化抽籤狀態
    resultText.innerText = "準備中...";
    slotImg.style.transform = "scale(1)";
    slotImg.classList.remove('spinning');

    // 分流邏輯 (功能 2 & 3)
    if (type === 'tea-shop') {
        runTeaShopLogic();
    } else if (type === 'decision') {
        runDecisionLogic();
    } else {
        runSlotLogic(type);
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('draw-screen').classList.add('hidden');
}

// --- 4. 飲料店專屬拉霸 (功能 2) ---
async function runTeaShopLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    
    // 設定隨機轉動總時長 (2s - 3s)
    const totalDuration = Math.floor(Math.random() * 1000) + 2000; 
    let elapsed = 0;
    let delay = 120; // 初始延遲
    
    slotImg.classList.add('spinning');
    let finalResult = null;

    while (elapsed < totalDuration) {
        // 隨機選取飲料店並即時更新圖片
        finalResult = drinkOptions[Math.floor(Math.random() * drinkOptions.length)];
        slotImg.src = finalResult.img;
        resultText.innerText = "挑選中...";
        
        // 變速演算法：加速 -> 穩定 -> 減速
        const progress = elapsed / totalDuration;
        if (progress < 0.25) delay -= 8;      // 加速階段
        else if (progress > 0.7) delay += 25; // 減速階段
        else delay = 40;                      // 穩定高速

        delay = Math.max(30, Math.min(delay, 500)); 

        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    
    // 特殊結果文字回饋 (功能 4)
    if (finalResult.id === 'try-again') {
        resultText.innerText = "運氣不錯，再抽一次吧！";
    } else if (finalResult.id === 'dont-eat') {
        resultText.innerText = "今天休息，喝水就好！";
    } else {
        resultText.innerText = `今天喝：${finalResult.name}！`;
    }
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // 成功震動回饋
}

// --- 5. 基礎模塊抽籤 (功能 3) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    if(!items) return;
    
    slotImg.classList.add('spinning');
    let elapsed = 0;
    const totalDuration = 2000;
    let delay = 100;

    while (elapsed < totalDuration) {
        const randomImg = items[Math.floor(Math.random() * items.length)];
        slotImg.src = `assets/${type}/${randomImg}`;
        resultText.innerText = "抽籤中...";
        
        const progress = elapsed / totalDuration;
        delay = progress > 0.7 ? delay + 30 : 60;

        await new Promise(r => setTimeout(r, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
    if (navigator.vibrate) navigator.vibrate(50);
}

// --- 6. 要/不要 THINK 儀式感邏輯 (功能 3) ---
async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    // 第一階段：進入思考狀態 (THINK)
    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 1.8s ease-in-out";
    slotImg.style.transform = "scale(1.2)"; 
    resultText.innerText = "思考中...";
    
    await new Promise(r => setTimeout(r, 1800)); 

    // 第二階段：彈出結果
    const final = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${final}`;
    slotImg.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    slotImg.style.transform = "scale(1)"; 
    resultText.innerText = "結果揭曉！";
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// --- 7. PWA 安裝控制 (功能 4) ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-app');
    if(installBtn) installBtn.classList.remove('hidden');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}
