/* === Router: Hash-based routing === */

const Router = (() => {
  // Current route state
  const state = {
    page: 'encyclopedia',
    monsterId: null,
    itemId: null,
    gachaId: null,
  };

  function init() {
    window.addEventListener('hashchange', onHashChange);
    // Parse initial hash
    onHashChange();
  }

  function onHashChange() {
    const hash = location.hash.slice(1); // remove #
    parseHash(hash);
    // Derive mobile tab target from URL state
    let navigatedTo = null;
    if (state.monsterId) navigatedTo = 'monsters';
    if (state.itemId) navigatedTo = 'items'; // items wins if both set
    applyState({ navigatedTo });
  }

  function parseHash(hash) {
    // Reset
    state.page = 'encyclopedia';
    state.monsterId = null;
    state.itemId = null;
    state.gachaId = null;

    if (!hash) return;

    // #favorites
    if (hash === 'favorites') {
      state.page = 'favorites';
      return;
    }

    // #gacha or #gacha/<id>
    if (hash.startsWith('gacha')) {
      state.page = 'gacha';
      const parts = hash.split('/');
      if (parts[1]) state.gachaId = Number(parts[1]);
      return;
    }

    // #monster/<id>, #item/<id>, #monster/<id>/item/<id>
    const parts = hash.split('/');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'monster' && parts[i + 1]) {
        state.monsterId = Number(parts[i + 1]);
        i++;
      } else if (parts[i] === 'item' && parts[i + 1]) {
        state.itemId = Number(parts[i + 1]);
        i++;
      }
    }
  }

  function applyState(opts) {
    const navigatedTo = opts?.navigatedTo || null;
    // Track page transition (from gacha/favorites → encyclopedia)
    const prevPage = App.getCurrentPage();
    // Switch page
    App.switchToPage(state.page);

    // Only reset panels when transitioning TO encyclopedia from another page
    // (not when navigating within encyclopedia, e.g., clicking cards)
    if (state.page === 'encyclopedia' && prevPage !== 'encyclopedia') {
      if (state.itemId && !state.monsterId) {
        App.resetPanels({ monsters: false, items: true });
      } else if (state.monsterId && !state.itemId) {
        App.resetPanels({ monsters: true, items: false });
      }
    }

    if (state.page === 'favorites') {
      RenderFavorites.render();
      return;
    }

    if (state.page === 'gacha') {
      if (state.gachaId) {
        RenderGacha.openMachine(state.gachaId);
      } else {
        RenderGacha.render();
      }
      return;
    }

    // Encyclopedia page
    // Monster panel
    const monsterBody = document.getElementById('monster-body');
    if (state.monsterId && Data.getMonster(state.monsterId)) {
      App.showPanel('monsters', true);
      RenderDetail.showMonster(state.monsterId);
    } else if (monsterBody.dataset.mode === 'detail') {
      RenderList.showMonsterList();
    }

    // Item panel
    const itemBody = document.getElementById('item-body');
    if (state.itemId && Data.getItem(state.itemId)) {
      App.showPanel('items', true); // Force show item panel when navigating to item
      RenderDetail.showItem(state.itemId);
    } else if (itemBody.dataset.mode === 'detail') {
      RenderList.showItemList();
    }

    // Mobile: switch tab based on navigation intent (not persistent state)
    if (window.innerWidth < 768 && navigatedTo) {
      App.switchMobileTab(navigatedTo);
    }
  }

  /**
   * Navigate to a new state. Merges with current state.
   * Examples:
   *   navigate({ monsterId: 123 })           -> show monster detail
   *   navigate({ monsterId: null })           -> back to monster list
   *   navigate({ itemId: 456 })               -> show item detail
   *   navigate({ page: 'gacha', gachaId: 1 }) -> go to gacha page
   */
  function navigate(opts) {
    if (opts.page === 'favorites') {
      state.page = 'favorites';
      state.gachaId = null;
      state.monsterId = null;
      state.itemId = null;
      updateHash();
      applyState();
      return;
    }

    if (opts.page === 'gacha') {
      state.page = 'gacha';
      state.gachaId = opts.gachaId || null;
      state.monsterId = null;
      state.itemId = null;
      updateHash();
      applyState();
      return;
    }

    if (opts.page === 'encyclopedia') {
      state.page = 'encyclopedia';
      state.gachaId = null;
      if (!('monsterId' in opts)) state.monsterId = null;
      if (!('itemId' in opts)) state.itemId = null;
    }

    if ('monsterId' in opts) {
      state.monsterId = opts.monsterId;
    }
    if ('itemId' in opts) {
      state.itemId = opts.itemId;
    }

    // Determine which panel was navigated to (for mobile tab switching)
    let navigatedTo = null;
    if ('monsterId' in opts && opts.monsterId != null) navigatedTo = 'monsters';
    if ('itemId' in opts && opts.itemId != null) navigatedTo = 'items';

    updateHash();
    applyState({ navigatedTo });
  }

  function updateHash() {
    let hash = '';

    if (state.page === 'favorites') {
      hash = 'favorites';
    } else if (state.page === 'gacha') {
      hash = 'gacha';
      if (state.gachaId) hash += '/' + state.gachaId;
    } else {
      const parts = [];
      if (state.monsterId) parts.push('monster/' + state.monsterId);
      if (state.itemId) parts.push('item/' + state.itemId);
      hash = parts.join('/');
    }

    // Use replaceState to avoid flooding history with every click
    const newHash = hash ? '#' + hash : '';
    if (location.hash !== newHash) {
      history.pushState(null, '', newHash || location.pathname);
    }
  }

  // Update state + hash without triggering applyState (used by panel close)
  function clearState(opts) {
    if ('monsterId' in opts) state.monsterId = opts.monsterId;
    if ('itemId' in opts) state.itemId = opts.itemId;
    if ('gachaId' in opts) state.gachaId = opts.gachaId;
    updateHash();
  }

  function getState() {
    return { ...state };
  }

  return { init, navigate, getState, clearState };
})();
