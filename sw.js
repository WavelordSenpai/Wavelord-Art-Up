const CACHE_NAME='artup-v2',SHELL=['./','index.html','style.css','app.js','manifest.json','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=CACHE_NAME).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.includes('/.netlify/functions/'))return;
 if(/manifest\.json|icon-/.test(u.pathname))return e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
