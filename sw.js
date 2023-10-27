//CACHES BLIVER BRUGT TIL AT GEMME KODE OFFLINE - SÅ FILER MAN VIL TILGÅ OFFLINE BLIVER GEMT I CACHEN

const staticCacheName = 'static-caches-v4'
const dynamicCacheName = 'site-dynamic-v2'

// Array med filer
const assets = [
    './index.html',
    './fallback.html', 
    './js/ui.js',
    './css/styles.css',
    './img/error.jpg',
    './img/Frelly-K7D27.otf'
]


caches.open('my-cache').then(cache => {
    // Tilføj flere filerne fra arrayet ovenover
    cache.addAll(assets); 
});

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.addAll(assets)
        })
    )
	console.log('Service Worker has been installed');
})

//SLETTER OVERSKYDENDE CACHES SOM IKKE ER staticCacheName
// Activate Service Worker
self.addEventListener('activate', event => {
	console.log('Service Worker has been activated');
    event.waitUntil(// Bliver i scopet til task er udført
        caches.keys().then(keys => { //henter alle cache pakker
            const filteredKeys = keys.filter(key => key !== staticCacheName) //filtere array med alle uactuelle cache pakker
            filteredKeys.map(key => { //mapper array og sletter pakker
                caches.delete(key)
            })   
        })
    )
})

//TILFØJER SIDER(FILER) TIL CACHEN DYNAMISK
// Fetch event
self.addEventListener('fetch', event => {
    if(!(event.request.url.indexOf('http') === 0 )) return
	
	event.respondWith( // Kontroller svar på request
		caches.match(event.request).then(cacheRes => { // Kig efter file match i cache 
			return cacheRes || fetch(event.request).then(async fetchRes => { // Returner match fra cache - ellers hent fil på server
				return caches.open(dynamicCacheName).then(cache => { // Tilføjer nye sider til cachen
					cache.put(event.request.url, fetchRes.clone()) // Bruger put til at tilføje sider til vores cache via clone
					return fetchRes // Returnerer fetch request
				})
			})
		}).catch(() => {
            return caches.match('fallback.html')
        })
	)
    // BRUGES TIL AT UNDGÅ OVERLOAD AF FILER I VORES BROWSERCACHE FORDI DEN DYNAMISKE CACHE TILFØJER FILER
    //begræning - sat til 2
    const limitCacheTwo = (cacheName, numberOfAllowedFiles) => {
        caches.open(cacheName).then(cache => { // Åbn den angivede cache
            cache.keys().then(keys => {// Hent array af cache keys 
                if(keys.length > numberOfAllowedFiles) {// Hvis mængden af filer overstiger det tilladte
                    cache.delete(keys[0]).then(limitCacheTwo(caches, numberOfAllowedFiles))// Slet første index (ældste fil) og kør funktion igen indtil antal er nået
                }
            })
        })
    }
    limitCacheTwo(dynamicCacheName, 2)
})