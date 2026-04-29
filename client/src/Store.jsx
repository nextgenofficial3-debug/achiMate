import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE || '';

export function StoreProvider({ children }) {
  const [queue, setQueue] = useState(() => JSON.parse(localStorage.getItem('achimate_queue') || '[]'));
  const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('achimate_lib') || '[]'));
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('achimate_settings') || '{"autoQueue":true,"proxyPreview":true}'));
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('achimate_recent') || '[]'));
  const [activeResult, setActiveResult] = useState(null);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    localStorage.setItem('achimate_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('achimate_lib', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('achimate_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('achimate_recent', JSON.stringify(recent));
  }, [recent]);

  const addQueue = (item) => setQueue(q => q.some(existing => existing.url === item.url) ? q : [item, ...q]);
  const addManyToQueue = (items) => {
    setQueue(current => {
      const seen = new Set(current.map(item => item.url));
      const additions = items.filter(item => !seen.has(item.url));
      return [...additions, ...current].slice(0, 80);
    });
  };
  const removeQueue = (id) => setQueue(q => q.filter(i => i.id !== id));
  const clearQueue = () => setQueue([]);
  const addLibrary = (item) => {
    setLibrary(current => current.some(existing => existing.url === item.url) ? current : [{ ...item, savedAt: Date.now() }, ...current]);
  };
  const clearLibrary = () => setLibrary([]);
  const downloadUrl = (url) => `${API_BASE}/api/media/download?url=${encodeURIComponent(url)}`;
  const streamUrl = (url) => `${API_BASE}/api/media/stream?url=${encodeURIComponent(url)}`;

  const analyzeUrl = async ({ url, preferredType, quality }) => {
    setStatus({ state: 'loading', message: 'Analyzing URL and preparing media options...' });
    const response = await fetch(`${API_BASE}/api/media/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, preferredType, quality })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error?.message || 'Unable to analyze this link.';
      setStatus({ state: 'error', message });
      throw new Error(message);
    }
    const queuedOptions = payload.options.map(option => ({
      ...option,
      sourceUrl: payload.sourceUrl,
      sourceTitle: payload.title,
      status: 'ready',
      progress: 100,
      queuedAt: Date.now()
    }));
    setActiveResult({ ...payload, options: queuedOptions });
    setRecent(current => [{ ...payload, options: queuedOptions }, ...current.filter(item => item.sourceUrl !== payload.sourceUrl)].slice(0, 10));
    if (settings.autoQueue) addManyToQueue(queuedOptions);
    setStatus({ state: 'success', message: `${queuedOptions.length} media option${queuedOptions.length === 1 ? '' : 's'} ready.` });
    return { ...payload, options: queuedOptions };
  };

  return (
    <StoreContext.Provider value={{
      queue,
      setQueue,
      addQueue,
      addManyToQueue,
      removeQueue,
      clearQueue,
      library,
      setLibrary,
      addLibrary,
      clearLibrary,
      settings,
      setSettings,
      recent,
      activeResult,
      setActiveResult,
      status,
      setStatus,
      analyzeUrl,
      downloadUrl,
      streamUrl
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
