/**
 * Vitreous - 瑩透抽籤決定器 (進階優化版)
 * 1. PWA 安裝與離線資源管理
 * 2. 圖片預載進度條 (自動消失)
 * 3. 物理感拉霸動畫優化
 */

// --- 1. 資料與資源清單 ---
const ASSETS = [
    // UI 基礎圖標
    'assets/home/menu.svg', 'assets/home/restaurant.svg', 'assets/home/price.svg',
    'assets/home/count.svg', 'assets/home/drink.svg', 'assets/home/decision.svg',
    // 決策圖標
    'assets/decision/think.svg', 'assets/decision/yes.svg', 'assets/decision/no.svg',
    // 飲料店圖標 (20家)
    'assets/Tea-Shop/50lan.svg', 'assets/Tea-Shop/ching-shin.svg', 'assets/Tea-Shop/coco.svg',
    'assets/Tea-Shop/dayungs.svg', 'assets/Tea-Shop/guiji.svg', 'assets/Tea-Shop/kebuke.svg',
    'assets/Tea-Shop/louisa.svg', 'assets/Tea-Shop/macu.svg', 'assets/Tea-Shop/milksha.svg',
    'assets/Tea-Shop/nap-tea.svg', 'assets/Tea-Shop/sfc.svg', 'assets/Tea-Shop/starbucks.svg',
    'assets/Tea-Shop/tao-tao.svg', 'assets/Tea-Shop/tea-magic.svg', 'assets/Tea-Shop/tp-tea.svg',
    'assets/Tea-Shop/truedan.svg', 'assets/Tea-Shop/wutong.svg', 'assets/Tea-Shop/woo-tea.svg',
    'assets/Tea-Shop/yimuji.svg', 'assets/Tea-Shop/dont-eat.svg', 'assets/Tea-Shop/try-again.svg'
];

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

const DRAW_DATA = {
    menu: ['pasta.svg', 'ramen.svg', 'rice.svg', 'hotpot.svg'],
    restaurant: ['store_a.svg', 'store_b.svg', 'store_c.svg'],
    price: ['price_100.svg', 'price_200.svg', 'price_500.svg'],
    count: ['count_1.svg', 'count_2.svg', 'count_3.svg', 'count_4.svg'],
    decision: { think: 'think.svg', options: ['yes.svg', 'no.svg'] }
};

// --- 2. 圖片預載與進度條 (功能新增 2) ---
function initProgressBar() {
    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.innerHTML = `
        <div class="loader-content">
            <p>正在同步琉璃資源...</p>
            <div class="progress-container">
                <div id="progress-bar"></div>
            </div>
        </div>
    `;
    document.body.appendChild(loader);

    let loadedCount = 0;
    ASSETS.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
            loadedCount++;
            const progress = (loadedCount / ASSETS.length) * 100;
            document.getElementById('progress-bar').style.width = `${progress}%`;
            
            if (loadedCount === ASSETS.length) {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.remove(), 500);
                }, 600);
            }
        };
    });
}
window.addEventListener('DOMContentLoaded', initProgressBar);

// --- 3. PWA 安裝功能 (功能新增 1) ---
let deferredPrompt;
const installBtn = document.getElementById('install-app');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
    });
}

// --- 4. 優化拉霸動畫 (功能新增 3) ---
async function runTeaShopLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    
    // 動態物理參數
    const duration = 2500 + Math.random() * 1000; // 總時長
    let start = null;
    let lastToggle = 0;
    let currentDelay = 50; // 初始切換速度

    slotImg.classList.add('spinning');

    return new Promise((resolve) => {
        function animate(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            // 物理感曲線：前面快，最後 30% 開始線性減速 (Easing Out)
            if (timestamp - lastToggle > currentDelay) {
                const randomIndex = Math.floor(Math.random() * drinkOptions.length);
                const item = drinkOptions[randomIndex];
                slotImg.src = item.img;
                resultText.innerText = "正在挑選店鋪...";
                lastToggle = timestamp;

                // 隨進度增加延遲（模擬摩擦力停下）
                if (progress > 0.6) {
                    currentDelay += (progress * 25); 
                }
            }

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                // 結束動畫
                slotImg.classList.remove('spinning');
                const finalResult = drinkOptions[Math.floor(Math.random() * drinkOptions.length)];
                slotImg.src = finalResult.img;
                
                // 最終文字反饋
                if (finalResult.id === 'try-again') resultText.innerText = "運氣不錯，再抽一次！";
                else if (finalResult.id === 'dont-eat') resultText.innerText = "今天休息，省錢喝水！";
                else resultText.innerText = `今天喝：${finalResult.name}！`;
                
                if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
                resolve();
            }
        }
        requestAnimationFrame(animate);
    });
}

// --- 5. 其他既有功能保留 (不改動邏輯) ---
function startDraw(type) {
    const homeScreen = document.getElementById('home-screen');
    const drawScreen = document.getElementById('draw-screen');
    const resultText = document.getElementById('result-text');
    const slotImg = document.getElementById('slot-img');

    homeScreen.classList.add('hidden');
    drawScreen.classList.remove('hidden');
    
    resultText.innerText = "準備中...";
    slotImg.style.transform = "scale(1)";

    if (type === 'tea-shop') {
        runTeaShopLogic();
    } else if (type === 'decision') {
        runDecisionLogic();
    } else {
        runSlotLogic(type);
    }
}

async function runSlotLogic(type) {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const items = DRAW_DATA[type];
    
    slotImg.classList.add('spinning');
    let count = 0;
    const maxCount = 20;
    
    const timer = setInterval(() => {
        const randomImg = items[Math.floor(Math.random() * items.length)];
        slotImg.src = `assets/${type}/${randomImg}`;
        count++;
        if (count >= maxCount) {
            clearInterval(timer);
            slotImg.classList.remove('spinning');
            resultText.innerText = "推薦結果已就緒";
        }
    }, 100);
}

async function runDecisionLogic() {
    const slotImg = document.getElementById('slot-img');
    const resultText = document.getElementById('result-text');
    const { think, options } = DRAW_DATA.decision;

    slotImg.src = `assets/decision/${think}`;
    slotImg.style.transition = "transform 1.5s ease-in-out";
    slotImg.style.transform = "scale(1.2)"; 
    resultText.innerText = "思考中...";
    
    await new Promise(r => setTimeout(r, 1500)); 

    const final = options[Math.floor(Math.random() * options.length)];
    slotImg.src = `assets/decision/${final}`;
    slotImg.style.transform = "scale(1)"; 
    resultText.innerText = final === 'yes.svg' ? "就這麼辦！" : "再想想吧。";
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('draw-screen').classList.add('hidden');
}

// 模式切換
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}
if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

// Service Worker 註冊 (確保離線可用)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}
