// =====================================================================
// sw.js — "Service worker": un ayudante que vive en el navegador y
// guarda una copia de la app para que funcione SIN INTERNET.
// LECCIÓN: la versión NO se escribe aquí: viene de js/version.js.
// Cada vez que cambies código (html, css, js), sube la versión allá.
// El navegador revisa también los archivos de importScripts, así que
// al cambiar js/version.js detecta la versión nueva y muestra «Actualizar».
// Los datos (data/*.json) siempre se piden primero a internet, para que
// los tips nuevos lleguen sin cambiar la versión.
// =====================================================================
importScripts('js/version.js');
const VERSION = self.APP_VERSION;
const CACHE_APP = `deepal-app-${VERSION}`;
const CACHE_DATOS = 'deepal-datos';
const APP = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/version.js', 'js/tema.js', 'js/iconos.js', 'js/app.js', 'js/texto.js', 'js/buscador.js', 'js/ia.js', 'js/admin.js', 'js/chat.js', 'js/comunidad.js',
  'fonts/archivo-latin.woff2', 'icons/logo-deepal.svg', 'icons/icono-app.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
];
const DATOS = ['data/tips.json', 'data/directorio.json', 'data/catalogos.json', 'config/sitio.json', 'config/ia.json'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    // cache: 'reload' pide cada archivo al servidor y no a la caché del navegador
    // (si no, la copia sin conexión podría quedar con archivos de la versión anterior).
    const frescos = (lista) => lista.map((u) => new Request(u, { cache: 'reload' }));
    await (await caches.open(CACHE_APP)).addAll(frescos(APP));
    await (await caches.open(CACHE_DATOS)).addAll(frescos(DATOS));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('deepal-app-') && k !== CACHE_APP) await caches.delete(k);
    await self.clients.claim();
  })());
});

// La página pide activar la versión nueva cuando la persona toca «Actualizar»
self.addEventListener('message', (e) => { if (e.data === 'activar') self.skipWaiting(); });

async function primeroRed(req) {
  const cache = await caches.open(CACHE_DATOS);
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch(req, { signal: ctl.signal, cache: 'no-cache' });
    clearTimeout(t);
    if (r.ok) cache.put(req, r.clone());
    return r;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function primeroCache(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r.ok && new URL(req.url).origin === location.origin) (await caches.open(CACHE_APP)).put(req, r.clone());
    return r;
  } catch {
    if (req.mode === 'navigate') return caches.match('index.html');
    throw new Error('sin conexión');
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // las IAs, WhatsApp y el servicio de calificaciones van directo a internet
  if (/\/(data|config)\/[^/]+\.json$/.test(url.pathname)) { e.respondWith(primeroRed(req)); return; }
  if (req.mode === 'navigate') { e.respondWith(caches.match('index.html').then((r) => r || fetch(req))); return; }
  e.respondWith(primeroCache(req));
});
