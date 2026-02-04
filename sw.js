const CACHE_NAME = 'qr-keluarga-v3'; // Versi dinaikkan untuk kemaskini audio
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './manifest.json',
    'https://unpkg.com/html5-qrcode',
    'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // Fail bunyi kini tersedia offline
];

// Pemasangan Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Smartest 2050: Caching assets including audio...');
            return cache.addAll(ASSETS);
        })
    );
});

// Pembersihan Cache Lama (Penting untuk memastikan bunyi baru berfungsi)
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
            // Jika ada dalam cache, guna cache. Jika tidak, ambil dari internet.
            return res || fetch(e.request).catch(() => {
                // Jika offline dan cuba akses laman utama, hantar index.html
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
