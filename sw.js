const CACHE_NAME = 'vitreous-v1';
// 列出所有需要預下載的靜態資源
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  // 首頁圖片
  './assets/home/menu.svg',
  './assets/home/restaurant.svg',
  './assets/home/price.svg',
  './assets/home/count.svg',
  './assets/home/drink.svg',
  './assets/home/decision.svg'
  // 注意：這裡之後也要補上各選單內的單張 SVG 路徑
];

// 安裝並快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 攔截請求，優先從快取抓取 (實現離線使用)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
