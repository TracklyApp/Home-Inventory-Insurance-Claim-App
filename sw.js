const CACHE = 'trackly-shell-v12';
const ASSETS = ['./', './index.html', './styles.css', './theme.css', './theme.js', './app.js', './activation.js', './activation-key.js', './install.js', './navigation.js', './profile.js', './attachments.js', './backup.js', './reports.js', './rooms.js', './manual.js', './manual.css', './how-to-use.html', './output/pdf/trackly-how-to-use.pdf', './vendor/jspdf.umd.min.js', './vendor/pdf-font.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('trackly-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => (await caches.match(event.request, {ignoreSearch:true})) || caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
