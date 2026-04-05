const FAVORITES_KEY = 'favorite-doors';

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(String);
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: string[]) {
  if (typeof window === 'undefined') return;

  const uniqueIds = [...new Set(ids.map(String))];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds));
}

export function isFavorite(productId: string): boolean {
  return getFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: string): string[] {
  const current = getFavoriteIds();

  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];

  setFavoriteIds(next);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('favorites-changed', { detail: next }));
  }

  return next;
}