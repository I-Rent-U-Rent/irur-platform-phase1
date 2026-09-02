import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'irur_saved_homes';
const CHANGE_EVENT = 'irur:saved-homes-change';

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable (private mode etc.) - keep in-memory state only */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Saved / favourite listings, persisted in localStorage and kept in sync
 * across every component that uses the hook (and across tabs).
 */
export function useFavorites() {
  const [ids, setIds] = useState<number[]>(readIds);

  useEffect(() => {
    const sync = () => setIds(readIds());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isSaved = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((id: number) => {
    const current = readIds();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setIds(next);
    writeIds(next);
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    writeIds([]);
  }, []);

  return { ids, count: ids.length, isSaved, toggle, clear };
}
