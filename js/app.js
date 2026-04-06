/* === App: 初始化入口（v3 — 動態面板） === */

const App = (() => {
  let currentPage = 'encyclopedia'; // 'encyclopedia' | 'gacha'
  let mobileSection = 'monsters';   // 'monsters' | 'items'

  // #3: Dynamic panel visibility (desktop only)
  const panelState = {
    monsters: true,
    items: false,
  };
  // Track user-initiated closes — prevent auto-reopen
  const userClosed = {
    monsters: false,
    items: false,
  };

  async function init() {
    // Load data with progress updates
    const bar = document.getElementById('loading-bar');
    const status = document.getElementById('loading-status');

    try {
      await Data.loadAll((msg, pct) => {
        if (bar) bar.style.width = pct + '%';
        if (status) status.textContent = msg;
      });
    } catch (err) {
      if (status) status.textContent = 'Error loading data: ' + err.message;
      console.error('Data load failed:', err);
      return;
    }

    // Initialize modules
    Filters.init();
    Search.init();
    RenderList.init();
    Router.init();
    RenderGacha.init();
    RenderFavorites.init();

    // Bind header navigation
    bindNav();
    bindLangToggle();
    bindMobileTabs();
    bindPanelClose();
    bindPanelToggle();
    updateMobileLayout();
    updatePanelLayout();

    // Apply i18n
    I18n.updateDOM();

    // Hide loading overlay
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 300);
    }

    // Listen for resize to update mobile layout
    window.addEventListener('resize', Utils.debounce(updateMobileLayout, 150));
  }

  function bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        Router.navigate({ page });
      });
    });
  }

  function switchPage(page) {
    const pageChanged = currentPage !== page;
    currentPage = page;
    // Only reset user-closed state when page actually changes
    if (pageChanged) {
      userClosed.monsters = false;
      userClosed.items = false;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    const encyc = document.getElementById('page-encyclopedia');
    const gacha = document.getElementById('page-gacha');
    const favorites = document.getElementById('page-favorites');
    const mobileTabs = document.getElementById('mobile-tabs');
    const panelToggle = document.getElementById('panel-toggle');

    // Hide all pages
    encyc.classList.add('hidden');
    gacha.classList.add('hidden');
    favorites.classList.add('hidden');

    if (page === 'encyclopedia') {
      encyc.classList.remove('hidden');
      mobileTabs.style.display = '';
      if (panelToggle) panelToggle.style.display = '';
      updateMobileLayout();
      updatePanelLayout();
    } else if (page === 'gacha') {
      gacha.classList.remove('hidden');
      mobileTabs.style.display = 'none';
      if (panelToggle) panelToggle.style.display = 'none';
    } else if (page === 'favorites') {
      favorites.classList.remove('hidden');
      mobileTabs.style.display = 'none';
      if (panelToggle) panelToggle.style.display = 'none';
    }
  }

  function bindLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        I18n.setLang(lang);
        document.querySelectorAll('.lang-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        // Re-render current views
        RenderList.refresh();
        RenderGacha.refresh();
        RenderFavorites.refresh();
        Filters.render();
        // If detail views are open, re-render them
        if (Router.getState().monsterId) {
          RenderDetail.showMonster(Router.getState().monsterId);
        }
        if (Router.getState().itemId) {
          RenderDetail.showItem(Router.getState().itemId);
        }
      });
    });

    // Set initial state
    const lang = I18n.getLang();
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function bindMobileTabs() {
    document.querySelectorAll('.mobile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mobileSection = tab.dataset.section;
        document.querySelectorAll('.mobile-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.section === mobileSection);
        });
        updateMobileLayout();
      });
    });
  }

  // Panel toggle buttons in navbar
  function bindPanelToggle() {
    document.querySelectorAll('.panel-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        if (panelState[panel]) {
          // Trying to hide — only allow if the other panel is visible
          const other = panel === 'monsters' ? 'items' : 'monsters';
          if (!panelState[other]) return;
          hidePanel(panel);
        } else {
          // Show the panel
          userClosed[panel] = false;
          panelState[panel] = true;
          updatePanelLayout();
        }
      });
    });
  }

  function updatePanelToggleUI() {
    document.querySelectorAll('.panel-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', panelState[btn.dataset.panel]);
    });
  }

  // #3: Bind panel close buttons
  function bindPanelClose() {
    const monsterClose = document.getElementById('monster-panel-close');
    const itemClose = document.getElementById('item-panel-close');

    if (monsterClose) {
      monsterClose.addEventListener('click', () => hidePanel('monsters'));
    }
    if (itemClose) {
      itemClose.addEventListener('click', () => hidePanel('items'));
    }
  }

  function updateMobileLayout() {
    const isMobile = window.innerWidth < 768;
    const monstersPanel = document.getElementById('panel-monsters');
    const itemsPanel = document.getElementById('panel-items');

    if (isMobile) {
      monstersPanel.classList.toggle('panel--active', mobileSection === 'monsters');
      itemsPanel.classList.toggle('panel--active', mobileSection === 'items');
      // Update header height CSS var for dynamic calculation
      const header = document.querySelector('.header');
      if (header) {
        document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
      }
    } else {
      monstersPanel.classList.remove('panel--active');
      itemsPanel.classList.remove('panel--active');
    }
  }

  // #3: Panel visibility management
  function showPanel(panel, force) {
    if (panelState[panel]) return; // already visible
    if (!force && userClosed[panel]) return; // user manually closed, don't auto-reopen
    userClosed[panel] = false;
    panelState[panel] = true;
    updatePanelLayout();
  }

  function hidePanel(panel) {
    panelState[panel] = false;
    userClosed[panel] = true; // remember user intent
    // Clear stale router state for the closed panel
    if (panel === 'items') {
      Router.clearState({ itemId: null });
      RenderList.showItemList();
    } else if (panel === 'monsters') {
      Router.clearState({ monsterId: null });
      RenderList.showMonsterList();
    }
    // Ensure at least one panel is visible
    if (!panelState.monsters && !panelState.items) {
      panelState.monsters = true;
      userClosed.monsters = false;
    }
    updatePanelLayout();
  }

  // Reset panel state programmatically (no userClosed tracking)
  function resetPanels(config) {
    if ('monsters' in config) panelState.monsters = config.monsters;
    if ('items' in config) panelState.items = config.items;
    updatePanelLayout();
  }

  function updatePanelLayout() {
    // Only apply on desktop
    if (window.innerWidth < 768) return;

    const mp = document.getElementById('panel-monsters');
    const ip = document.getElementById('panel-items');

    mp.classList.toggle('panel--hidden', !panelState.monsters);
    ip.classList.toggle('panel--hidden', !panelState.items);

    // Full width when only one panel
    mp.classList.toggle('panel--full', panelState.monsters && !panelState.items);
    ip.classList.toggle('panel--full', !panelState.monsters && panelState.items);

    updatePanelToggleUI();
  }

  function switchToPage(page) {
    switchPage(page);
  }

  function switchMobileTab(section) {
    mobileSection = section;
    document.querySelectorAll('.mobile-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.section === mobileSection);
    });
    updateMobileLayout();
  }

  function getCurrentPage() { return currentPage; }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  return { switchToPage, switchMobileTab, getCurrentPage, showPanel, hidePanel, resetPanels };
})();
