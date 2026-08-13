// 혼매경북팀 업무 지원 시스템 서비스워커
// 이 앱은 실시간 KPI/실적 데이터를 다루는 도구라, 오래된 캐시가 최신 데이터/코드를
// 가리면 안 된다. 그래서 "네트워크 우선, 실패 시에만 캐시" 전략을 쓴다 — 온라인일 때는
// 항상 최신 파일을 받아오고, 오프라인일 때만 마지막으로 받아둔 캐시를 보여준다.
const CACHE_NAME = 'honmae-kb2-v1';
const CORE_ASSETS = ['./index.html', './m.html', './app.js', './manifest.json', './manifest-m.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
