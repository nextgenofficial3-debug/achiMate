import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [queue, setQueue] = useState(() => JSON.parse(localStorage.getItem('achimate_queue') || '[]'));
  const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('achimate_lib') || '[]'));
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('achimate_settings') || '{"autoQueue":true,"proxyPreview":true}'));

  useEffect(() => {
    localStorage.setItem('achimate_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('achimate_lib', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('achimate_settings', JSON.stringify(settings));
  }, [settings]);

  const addQueue = (item) => setQueue(q => [item, ...q]);
  const removeQueue = (id) => setQueue(q => q.filter(i => i.id !== id));
  const clearQueue = () => setQueue([]);

  return (
    <StoreContext.Provider value={{ queue, setQueue, addQueue, removeQueue, clearQueue, library, setLibrary, settings, setSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
