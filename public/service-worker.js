const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    '../routes/api.js',
    './manifest.json'
];

//install service worker
self.addEventListener('install', function (e){
  //tell browser to wait until work is complete before terminating service worker
  e.waitUntil(
    //caches.open finds specific cache by name, then add every file from FILES_TO_CACHE array to cache
    caches.open(CACHE_NAME).then(function (cache){
      console.log('installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE);
    })
  )
});

//activate service worker
self.addEventListener('activate', function(e){
  e.waitUntil(
    //.keys returns array of all cache names which we call keyList (parameter)
    caches.keys().then(function (keyList){
      //cacheKeepList will be an array holding all the cache names we are keeping using filter method
      let cacheKeepList = keyList.filter(function(key){
        return key.indexOf(APP_PREFIX);
      })
      //push array of cache namesfrom cacheKeepList into CACHE_NAME
      cacheKeepList.push(CACHE_NAME);
    
      //do not return until all promises are returned or rejected
      return Promise.all(keyList.map(function(key, i){
        //if any key cant be found in cacheKeepList...
        if(cacheKeepList.indexOf(key)=== -1){
          console.log('deleting cache : ' + keyList[i] );
          //it will be deleted (-1 will be returned for keys not found in existing key list)
          return caches.delete(keyList[i]);
        }
      }));
    })
  )
});

//fetch cached files for offline functionality
self.addEventListener('fetch', function(e){
  console.log('fetch request: ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function(request){
      //if request matches cached url, return cache url
      if(request){
        console.log('responding with cache: ' + e.request.url)
        return request
        //if not, service worker will fetch it from the network
      } else {
        console.log('file is not cached, fetching : ' + e.request.url)
    return fetch(e.request)
      }
    })
  )
})
