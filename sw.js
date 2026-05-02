/**
 * Vitreous Service Worker - v2
 * 負責離線快取與資源管理，確保「墨影琉璃」視覺在斷網時不破圖。
 */

const CACHE_NAME = 'vitreous-v2';

// 完整資源清單：確保 20 家飲料店圖標也包含在內
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  
  // 首頁 UI 用的圖示
  './assets/home/menu.svg',
  './assets/home/restaurant.svg',
  './assets/home/price.svg',
  './assets/home/count.svg',
  './assets/home/drink.svg',
  './assets/home/decision.svg',
  
  // 飲料店專屬圖標 (對應 script.js 中的路徑)
  './assets/Tea-Shop/50lan.svg',
  './assets/Tea-Shop/ching-shin.svg',
  './assets/Tea-Shop/coco.svg',
  './assets/Tea-Shop/dayungs.svg',
  './assets/Tea-Shop/guiji.svg',
  './assets/Tea-Shop/kebuke.svg',
  './assets/Tea-Shop/louisa.svg',
  './assets/Tea-Shop/macu.svg',
  './assets/Tea-Shop/milksha.svg',
  './assets/Tea-Shop/nap-tea.svg',
  './assets/Tea-Shop/sfc.svg',
  './assets/Tea-Shop/starbucks.svg',
  './assets/Tea-Shop/tao-tao.svg',
  './assets/Tea-Shop/tea-magic.svg',
  './assets/Tea-Shop/tp-tea.svg',
  './assets/Tea-Shop/truedan.svg',
  './assets/Tea-Shop/wutong.svg',
  './assets/Tea-Shop/woo-tea.svg',
  './assets/Tea-Shop/yimuji.svg',
  './assets/Tea-Shop/dont-eat.svg',
  './assets/Tea-Shop/try-again.svg',
  
  // 決策模組圖示
  './assets/decision/think.svg',
  './assets/decision/yes.svg',
  './assets/decision/no.svg'
];

// 1. 安裝階段：將所有資源存入快取庫
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Vitreous: 正在快取完整資源...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 強制讓新的 SW 立即接管，不用等待舊版關閉
  self.skipWaiting();
});

// 2. 激活階段：清理舊版本的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Vitreous: 清理舊快取', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  // 確保 SW 激活後立即控制所有頁面
  self.clients.claim();
});

// 3. 抓取階段：攔截請求，優先使用快取內容 (Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 若快取中有資源則回傳，否則從網路抓取
      return response || fetch(event.request);
    })
  );
});
