const CACHE_NAME = 'qr-keluarga-v3';

// Senarai aset yang perlu disimpan untuk kegunaan tanpa internet
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './manifest.json',
    './generator.html',
    'https://unpkg.com/html5-qrcode',
    'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // URL Audio Beep
];

// 1. Pemasangan Service Worker (Install)
self.addEventListener('install', (e) => {
    // Memaksa Service Worker baru menggantikan yang lama serta-merta
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Smartest 2050: Menyimpan aset ke dalam cache offline...');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. Pembersihan Cache Lama (Activate)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('Smartest 2050: Memadam cache lama:', key);
                    return caches.delete(key);
                })
            );
        })
    );
});

// 3. Pengurusan Permintaan Data (Fetch)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => {
            // Gunakan fail dari cache jika ada, jika tidak, ambil dari rangkaian (network)
            return res || fetch(e.request).catch(() => {
                // Jika pengguna offline dan cuba akses halaman, hantar index.html
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
