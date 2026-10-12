/* ==========================================================
   Service Worker : Quincaillerie Tycoon
   - Précharge le jeu à la première visite → fonctionne sans connexion.
   - Lance le jeu instantanément depuis le cache, puis se met à jour en arrière-plan.
   - La sauvegarde de la partie (localStorage) n'est jamais touchée par ce script.

   POUR PUBLIER UNE NOUVELLE VERSION : changez CACHE_VERSION ci-dessous.
   ========================================================== */
const CACHE_VERSION = 'v1';
const CORE_CACHE = 'quincaillerie-core-' + CACHE_VERSION;

// Chemins relatifs : fonctionne à la racine d'un domaine comme dans un sous-dossier GitHub Pages.
const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

/* ---------- Installation : on précharge le jeu ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activation : on supprime les anciens caches ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('quincaillerie-') && k !== CORE_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- « Stale-while-revalidate » : cache tout de suite, mise à jour en arrière-plan ---------- */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CORE_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

/* ---------- Interception des requêtes ---------- */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // tout ce qui est externe : réseau normal

  // Ouverture du jeu : cache d'abord, jamais d'écran blanc hors ligne.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CORE_CACHE);
        const cached = await cache.match('index.html');
        const refresh = fetch('index.html', { cache: 'no-cache' })
          .then((r) => { if (r && r.ok) cache.put('index.html', r.clone()); return r; })
          .catch(() => null);
        if (cached) { event.waitUntil(refresh); return cached; }
        return (await refresh) || Response.error();
      })()
    );
    return;
  }

  // Autres fichiers du jeu (icônes, manifest…)
  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
