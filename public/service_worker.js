const CACHE_NAME = 'segment-cache-v1';

function shouldCache(url) {
  return url.endsWith('.mp4') || url.endsWith('.m4s');
}

function loadFromCacheOrFetch(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(response) {
      if (response) {
        // The custom header was added before putting it in the cache.
        console.log('Handling cached request', request.url);
        return response;
      }

      // Request not cached, make a real request for the file.
      return fetch(request).then(function(response) {
        // Cache any successfully request for an MP4 segment.  Service
        // workers cannot cache 206 (Partial Content).  This means that
        // content that uses range requests (e.g. SegmentBase) will require
        // more work.
        if (response.ok && response.status != 206 && shouldCache(request.url)) {
          console.log('Caching MP4 segment', request.url);
          cacheResponse(cache, request, response);
        }

        return response;
      });
    });
  })
}

function cacheResponse(cache, request, response) {
  // Response objects are read-only, so to add our custom header, we need to
  // recreate the object.
  const init = {
    status: response.status,
    statusText: response.statusText,
    headers: {'X-Shaka-From-Cache': true}
  };

  response.headers.forEach(function(value, key) {
    init.headers[key] = value;
  });

  // Response objects are single use.  This means we need to call clone() so
  // we can both store the ArrayBuffer and give the response to the page.
  return response.clone().arrayBuffer().then(function(ab) {
    cache.put(request, new Response(ab, init));
  });
}


self.addEventListener('fetch', function(event) {
  event.respondWith(loadFromCacheOrFetch(event.request));
});