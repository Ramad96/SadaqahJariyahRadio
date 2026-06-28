import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_NAME = 'sjr-audio-v1';
const SAVED_KEY = 'offlineSaved';

/**
 * Manages explicit offline saving of surah audio.
 * Tracks which surah+URL pairs the user has pinned, with download progress.
 */
export function useOfflineAudio() {
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '{}'); }
    catch { return {}; }
  });
  // { [url]: number (0–1) | null (indeterminate) }
  const [downloadStates, setDownloadStates] = useState({});
  const abortRefs = useRef({});

  // Verify localStorage entries still exist in the actual cache on mount
  useEffect(() => {
    if (!('caches' in window)) return;
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '{}'); }
      catch { return {}; }
    })();
    if (!Object.keys(saved).length) return;

    caches.open(CACHE_NAME).then(async cache => {
      const verified = {};
      for (const [id, url] of Object.entries(saved)) {
        const hit = await cache.match(url);
        if (hit) verified[id] = url;
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(verified));
      setSavedIds(verified);
    }).catch(() => {});
  }, []);

  const downloadAudio = useCallback(async (surahId, url) => {
    if (abortRefs.current[url]) return;

    const controller = new AbortController();
    abortRefs.current[url] = controller;
    setDownloadStates(prev => ({ ...prev, [url]: null }));

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) {
          setDownloadStates(prev => ({ ...prev, [url]: received / total }));
        }
      }

      // Ensure the file is explicitly in our cache (SW may have already done it)
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const existing = await cache.match(url);
        if (!existing) {
          const blob = new Blob(chunks, { type: 'audio/mpeg' });
          await cache.put(url, new Response(blob, {
            headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(blob.size) },
          }));
        }
      }

      setSavedIds(prev => {
        const next = { ...prev, [surahId]: url };
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[offline] download failed:', url, err);
      }
    } finally {
      setDownloadStates(prev => { const n = { ...prev }; delete n[url]; return n; });
      delete abortRefs.current[url];
    }
  }, []);

  const cancelOrRemove = useCallback(async (surahId, url) => {
    if (abortRefs.current[url]) {
      abortRefs.current[url].abort();
      return;
    }
    if ('caches' in window) {
      caches.open(CACHE_NAME).then(c => c.delete(url)).catch(() => {});
    }
    setSavedIds(prev => {
      const next = { ...prev };
      delete next[surahId];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { savedIds, downloadStates, downloadAudio, cancelOrRemove };
}
