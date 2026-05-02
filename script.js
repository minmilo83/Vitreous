/**
 * Vitreous - 瑩透抽籤決定器 (結合 20 家飲料店輪盤)
 * 功能：PWA 安裝控制、黑白模式切換、變速拉霸邏輯、THINK 儀式感
 */

// --- 1. 舊有資料配置 (保留你的舊版設定) ---
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

// --- 2. 新增：飲料店專屬資料設定 (共 20 個選項) ---
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
    { id: 'dont-eat',   name: '今天不要吃',    img: 'assets/Tea-Shop/dont-eat.svg' },
    { id: 'try-again',  name: '再抽一次',      img: 'assets/Tea-Shop/try-again.svg' }
];

// --- 3. PWA 手動安裝邏輯 ---
let deferredPrompt;
const installBtn = document.getElementById('install-app');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(installBtn) installBtn.classList.remove('hidden');
});

if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install: ${outcome}`);
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        }
    });
}

window.addEventListener('appinstalled', () => {
    console.log('Vitreous 已成功安裝');
    if(installBtn) installBtn.classList.add('hidden');
});

// --- 4. 深淺模式切換 ---
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

// --- 5. 導航邏輯 (新增 tea-shop 判斷) ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    if(homeScreen) homeScreen.classList.add('hidden');
    if(drawScreen) drawScreen.classList.remove('hidden');
    if(resultText) resultText.innerText = "轉動中..."; 
    if(slotImg) slotImg.style.transform = "scale(1)";

    // 判斷要執行哪一種抽籤邏輯
    if (type === 'decision') {
        runDecisionLogic();
    } else if (type === 'tea-shop') {
        runTeaShopLogic(); // 執行新的飲料店拉霸
    } else {
        runSlotLogic(type);
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('draw-screen').classList.add('hidden');
}

// --- 6. 新增：專屬飲料店的拉霸演算法 ---
async function runTeaShopLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    
    // 隨機轉動總時間 2.0s - 3.0s
    const totalDuration = Math.floor(Math.random() * 1000) + 2000; 
    let elapsed = 0;
    let delay = 120; // 初始延遲 (ms)
    
    slotImg.classList.add('spinning');
    let finalResult = null;

    while (elapsed < totalDuration) {
        // 隨機挑選一家店
        const randomIndex = Math.floor(Math.random() * drinkOptions.length);
        finalResult = drinkOptions[randomIndex];
        
        // 在轉動過程中不斷替換圖片
        slotImg.src = finalResult.img;
        // 轉動時也可以讓文字跟著閃爍店名（增加Vibe感）
        resultText.innerText = finalResult.name; 
        
        const progress = elapsed / totalDuration;
        // 變速曲線
        if (progress < 0.25) delay -= 8;      // 加速
        else if (progress > 0.7) delay += 25; // 減速
        else delay = 40;                      // 高速穩定

        delay = Math.max(30, Math.min(delay, 500)); // 限制範圍

        await new Promise(resolve => setTimeout(resolve, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    
    // 結算畫面文字判斷
    if (finalResult.id === 'try-again') {
        resultText.innerText = "運氣不錯，再抽一次吧！";
    } else if (finalResult.id === 'dont-eat') {
        resultText.innerText = "今天休息，喝水就好！";
    } else {
        resultText.innerText = `今天喝：${finalResult.name}！`;
    }
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // 結束震動回饋
}

// --- 7. 舊版拉霸演算法 (保留給你的 menu, restaurant 等使用) ---
async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    if(!items) return;
    
    const totalDuration = Math.floor(Math.random() * 1000) + 2000; 
    let elapsed = 0;
    let delay = 120; 
    
    slotImg.classList.add('spinning');

    while (elapsed < totalDuration) {
        const randomIndex = Math.floor(Math.random() * items.length);
        slotImg.src = `assets/${type}/${items[randomIndex]}`;
        
        const progress = elapsed / totalDuration;
        if (progress < 0.25) delay -= 8;      
        else if (progress > 0.7) delay += 25; 
        else delay = 40;                      

        delay = Math.max(30, Math.min(delay, 500)); 

        await new Promise(resolve => setTimeout(resolve, delay));
        elapsed += delay;
    }

    slotImg.classList.remove('spinning');
    resultText.innerText = "這是您的結果";
    
    if (navigator.vibrate) navigator.vibrate(50); 
}

// --- 8. 要/不要 THINK 邏輯 (保留) ---
async function runDecisionLogic() {
    // ... (保留你原本的程式碼，此處省略以保持整潔，你可以直接使用上面完整區塊)
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 2s ease-in-out";
    slotImg.style.transform = "scale(1.15)"; 
    
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    const finalResult = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${finalResult}`;
    slotImg.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    slotImg.style.transform = "scale(1)"; 
    
    resultText.innerText = "這是您的結果";
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// --- 9. Service Worker 註冊 ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker 已註冊'))
            .catch(err => console.log('Service Worker 註冊失敗', err));
    });
}
