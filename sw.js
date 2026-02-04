const CACHE_NAME = 'qr-keluarga-v2';
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './manifest.json',
    'https://unpkg.com/html5-qrcode'
];

// Pemasangan Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS);
        })
    );
});

// Pembersihan Cache Lama
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Strategi Fetch (Offline First)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request).catch(() => {
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
