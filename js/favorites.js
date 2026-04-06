/* === Favorites: 收藏功能 data store === */

const Favorites = (() => {
  const STORAGE_KEY = 'chronostory-favorites';

  // Internal state: { monsters: Set<number>, items: Set<number> }
  const store = { monsters: new Set(), items: new Set() };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        store.monsters = new Set((data.monsters || []).map(Number));
        store.items = new Set((data.items || []).map(Number));
      }
    } catch (e) {
      console.warn('Favorites: failed to load', e);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      monsters: [...store.monsters],
      items: [...store.items],
    }));
  }

  function toggle(type, id) {
    const set = store[type];
    if (!set) return;
    id = Number(id);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    save();
    document.dispatchEvent(new CustomEvent('favorites-changed', {
      detail: { type, id, isFav: set.has(id) }
    }));
  }

  function has(type, id) {
    return store[type]?.has(Number(id)) || false;
  }

  function getAll(type) {
    return [...(store[type] || [])];
  }

  function count() {
    return store.monsters.size + store.items.size;
  }

  // Shared star SVG icon
  function starSVG(filled) {
    return `<svg class="fav-star-icon" viewBox="0 0 24 24" width="18" height="18" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
    </svg>`;
  }

  // Load on module init
  load();

  return { toggle, has, getAll, count, starSVG };
})();
