// Офлайн-кэш оболочки приложения (нужен для запуска установленной PWA без сети,
// в первую очередь на iOS). Кэшируем только статику: HTML, JS/CSS-чанки, шрифты,
// картинки. НЕ трогаем API (/api/), скачивание APK и медиа (audio/video, range-запросы).
//
// Стратегии:
//  - навигация и index.html — network-first (свежая версия при наличии сети,
//    кэш как офлайн-фолбэк);
//  - остальная статика — cache-first (JS/CSS-чанки хэшированы в имени).
//
// Имя кэша — «<name>-<version>» из package.json: при сборке vite.config.mjs подставляет
// его вместо метки ниже (плагин swCacheName). Версия поднимается при каждой выкладке
// (scripts/bump-version.mjs) — у новой сборки новый кэш, старый удаляется в activate,
// а сам файл SW меняется, и браузер его обновляет. Вручную ничего поднимать не нужно.
//
// Регистрируется только в настоящем браузере в production (см. main.js, FEATURES.pwa).
const CACHE_NAME = '__APP_CACHE_NAME__';

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './favicon.ico',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            // reload — мимо HTTP-кэша: в предустановку должна попасть свежая версия
            .then(cache => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, {cache: 'reload'}))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

function isCacheableStatic(request) {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false; // чужие домены не кэшируем
    if (url.pathname.includes('/api/')) return false;      // динамика с сервера
    if (url.pathname.includes('/app/get')) return false;   // скачивание APK
    if (request.destination === 'audio' || request.destination === 'video') return false;
    if (request.headers.has('range')) return false;        // partial-ответы класть в кэш нельзя
    return true;
}

async function networkFirstNavigation(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        // no-cache — принудительная ревалидация на сервере (по ETag это дёшево):
        // сервер не шлёт Cache-Control, и без этого браузер по эвристике отдавал
        // index.html из HTTP-кэша — свежие деплои подолгу не доезжали до телефона
        const response = await fetch(request, {cache: 'no-cache'});
        if (response.ok) {
            cache.put('./index.html', response.clone());
        }
        return response;
    } catch (e) {
        const cached = await cache.match('./index.html');
        if (cached) return cached;
        throw e;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    // 206 и ошибки в кэш не кладём — иначе офлайн будет отдавать мусор
    if (response.ok && response.status !== 206) {
        cache.put(request, response.clone());
    }
    return response;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(request));
        return;
    }

    if (isCacheableStatic(request)) {
        event.respondWith(cacheFirst(request));
    }
    // Всё остальное (API, медиа, range-запросы) уходит в сеть напрямую,
    // без respondWith — браузер обрабатывает как обычно.
});
