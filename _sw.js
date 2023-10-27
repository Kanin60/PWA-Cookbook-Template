const staticCache = 'static-cache-v1.3'

//alle filer som skal kunne vises offline
const assets = [
    // './index.thml',
    // './assets/js/christmas-calender.js',
    // './assets/css/styles.css',
    // './assets/img/hero.jpg',
    // './assets/img/icons/exit.svg',
    // './fallback.html'
    './index.html',
    './fallback.html', 
    './js/ui.js',
    './css/styles.css',
    './img/error.jpg',
    './img/Frelly-K7D27.otf',
    // './pages/about.html'
]

// Tilføjer alle filerne fra arrayet assets til cache
self.addEventListener('install', async function (event) {
    event.waitUntil(
        caches.open(staticCache).then(cache => {
        return cache.addAll(assets);
    }));
});

//Sletter alle caches som ikke er staticCache ved at sammenligne cache
self.addEventListener('activate', event => {
    event.waitUntill(
        caches.keys().then(keys => {
            const filteredKeys = keys.filter(key => key !== staticCache)
            filteredKeys.map(key => {
                caches.delete(key)
            })
        })
    )
})