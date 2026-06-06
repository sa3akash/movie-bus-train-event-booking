const VIDEO_CACHE_NAME = 'segment-cache-v1';
const ASSETS_CACHE_NAME = 'nextjs-assets-v1';
const PAGES_CACHE_NAME = 'nextjs-pages-v1';

const CACHES_TO_KEEP = [VIDEO_CACHE_NAME, ASSETS_CACHE_NAME, PAGES_CACHE_NAME];

const OFFLINE_URL = '/offline';
const DOWNLOADS_URL = '/downloads';

// ----------------------------------------------------------------------------
// Lifecycle Events
// ----------------------------------------------------------------------------

self.addEventListener('install', function(event) {
  event.waitUntil(
    (async function() {
      try {
        const pagesCache = await caches.open(PAGES_CACHE_NAME);
        const assetsCache = await caches.open(ASSETS_CACHE_NAME);

        const urlsToFetch = [OFFLINE_URL, DOWNLOADS_URL];
        
        for (const url of urlsToFetch) {
          // Fetch the latest HTML
          const response = await fetch(new Request(url, { cache: 'reload' }));
          
          // Clone it to put in the pages cache
          await pagesCache.put(url, response.clone());
          
          // Read the HTML text to find JS and CSS chunks
          const html = await response.text();
          
          const assetUrls = [];
          
          // Match scripts
          const scriptRegex = /<script[^>]*src=["'](\/_next\/[^"']+)["']/g;
          let match;
          while ((match = scriptRegex.exec(html)) !== null) {
            assetUrls.push(match[1]);
          }
          
          // Match stylesheets
          const linkRegex = /<link[^>]*href=["'](\/_next\/[^"']+)["'][^>]*rel=["']stylesheet["']/g;
          const linkRegex2 = /<link[^>]*rel=["']stylesheet["'][^>]*href=["'](\/_next\/[^"']+)["']/g;
          
          while ((match = linkRegex.exec(html)) !== null) {
            assetUrls.push(match[1]);
          }
          while ((match = linkRegex2.exec(html)) !== null) {
            assetUrls.push(match[1]);
          }
          
          // Deduplicate and cache all found assets
          const uniqueAssets = [...new Set(assetUrls)];
          console.log(`Pre-caching ${uniqueAssets.length} assets for ${url}`);
          
          for (const assetUrl of uniqueAssets) {
            try {
              const assetResponse = await fetch(assetUrl);
              if (assetResponse.ok) {
                await assetsCache.put(assetUrl, assetResponse);
              }
            } catch (err) {
              console.log('Failed to precache asset:', assetUrl);
            }
          }
        }
      } catch (err) {
        console.error('Failed to precache offline pages during install:', err);
      }
      
      // Activate the new service worker immediately
      return self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (!CACHES_TO_KEEP.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ----------------------------------------------------------------------------
// Routing and Caching Strategies
// ----------------------------------------------------------------------------

function isVideoSegment(url) {
  return url.endsWith('.mp4') || url.endsWith('.m4s');
}

function handleVideoRequest(request) {
  return caches.open(VIDEO_CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(request).then(function(networkResponse) {
        if (networkResponse.ok && networkResponse.status !== 206) {
          cacheVideoResponse(cache, request, networkResponse);
        }
        return networkResponse;
      });
    });
  });
}

function cacheVideoResponse(cache, request, response) {
  const init = {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers()
  };

  response.headers.forEach(function(value, key) {
    init.headers.set(key, value);
  });
  
  init.headers.set('X-Shaka-From-Cache', 'true');

  return response.clone().arrayBuffer().then(function(ab) {
    cache.put(request, new Response(ab, init));
  });
}

// Cache First Strategy for Assets
function handleAssetRequest(request) {
  // ignoreSearch and ignoreVary ensures dev-mode query params don't break caching
  return caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cachedResponse) {
    if (cachedResponse) {
      return cachedResponse;
    }
    return fetch(request).then(function(networkResponse) {
      if (networkResponse.ok || networkResponse.status === 0) {
        const responseToCache = networkResponse.clone();
        caches.open(ASSETS_CACHE_NAME).then(function(cache) {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(function() {
      return new Response('', { status: 503, statusText: 'Offline' });
    });
  });
}

// Network First Strategy for general Pages and Data, but Cache First for Offline Pages
function handlePageRequest(request) {
  const url = new URL(request.url);

  // 1. CACHE FIRST Strategy for the designated offline pages
  // This completely prevents the "fetch" network error from happening when you are offline!
  if (url.pathname === OFFLINE_URL || url.pathname.startsWith(OFFLINE_URL + '/')) {
    return caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      // If not in cache, try network
      return fetch(request).catch(function() {
        return new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });
    });
  }

  // 2. NETWORK FIRST Strategy for all other pages
  return fetch(request).then(function(networkResponse) {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      caches.open(PAGES_CACHE_NAME).then(function(cache) {
        cache.put(request, responseToCache);
      });
    }
    return networkResponse;
  }).catch(function() {
    // If the network fails, DO NOT serve the cached HTML for this page
    // because in Next.js Dev Mode, the JS chunks for it are likely missing, 
    // leaving the page frozen in a "Loading..." state!
    
    if (request.mode === 'navigate') {
      // EXCEPTION: We want the Downloads page to be accessible offline!
      const url = new URL(request.url);
      if (url.pathname === DOWNLOADS_URL || url.pathname.startsWith(DOWNLOADS_URL + '/')) {
        return caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return Response.redirect(OFFLINE_URL, 302);
        });
      }
      
      // Instead, if it's a full page navigation, completely redirect to the safe /offline page!
      return Response.redirect(OFFLINE_URL, 302);
    }
    
    // For API calls or Next.js data requests, try to return cached data, otherwise fail gracefully
    return caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('', { status: 503 });
    });
  });
}

// ----------------------------------------------------------------------------
// Fetch Interceptor
// ----------------------------------------------------------------------------

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);

  // Skip unsupported schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Shaka Player Videos
  if (isVideoSegment(url.pathname)) {
    event.respondWith(handleVideoRequest(request));
    return;
  }

  // Only handle GET requests for other caching
  if (request.method !== 'GET') {
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Manifests, Fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot|webmanifest|json)$/)
  ) {
    event.respondWith(handleAssetRequest(request));
    return;
  }

  // 3. Everything else (HTML Pages, API GET requests, _next/data)
  // Network first, fallback to cache or offline page
  event.respondWith(handlePageRequest(request));
});