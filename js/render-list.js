/* === RenderList: 卡片網格 + 無限捲動 === */

const RenderList = (() => {
  const BATCH_SIZE = 60;

  // State per section
  const state = {
    monsters: { filtered: [], rendered: 0, observer: null },
    items: { filtered: [], rendered: 0, observer: null },
  };

  function init() {
    renderMonsters();
    renderItems();

    // Listen for favorites changes to update star buttons in-place
    document.addEventListener('favorites-changed', (e) => {
      const { type, id, isFav } = e.detail;
      const bodyId = type === 'monsters' ? 'monster-body' : 'item-body';
      const body = document.getElementById(bodyId);
      if (!body) return;
      const card = body.querySelector(`.card[data-id="${id}"]`);
      if (!card) return;
      const btn = card.querySelector('.fav-btn');
      if (!btn) return;
      btn.classList.toggle('fav-btn--active', isFav);
      btn.innerHTML = Favorites.starSVG(isFav);
      btn.title = isFav ? I18n.t('favorites.remove') : I18n.t('favorites.add');
    });
  }

  function refresh() {
    renderMonsters();
    renderItems();
  }

  // === Monsters ===

  function renderMonsters() {
    const s = state.monsters;
    const query = Search.getMonsterQuery();
    s.rendered = 0;

    const body = document.getElementById('monster-body');
    if (body.dataset.mode === 'detail') return;
    body.dataset.mode = 'list';
    body.innerHTML = '';

    // #8: show prompt when no filters and no search
    if (!Filters.hasActiveMonsterFilters() && !query) {
      const prompt = document.createElement('div');
      prompt.className = 'empty-prompt';
      prompt.textContent = I18n.t('empty.monsterPrompt');
      body.appendChild(prompt);
      updateMonsterCount();
      return;
    }

    s.filtered = Filters.applyMonsterFilters(query);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    grid.id = 'monster-grid';
    body.appendChild(grid);

    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    body.appendChild(sentinel);

    appendMonsterBatch(grid);
    updateMonsterCount();
    setupObserver('monsters', body, sentinel, grid);
  }

  function appendMonsterBatch(grid) {
    const s = state.monsters;
    const end = Math.min(s.rendered + BATCH_SIZE, s.filtered.length);

    for (let i = s.rendered; i < end; i++) {
      grid.appendChild(createMonsterCard(s.filtered[i]));
    }
    s.rendered = end;
  }

  function createMonsterCard(monster) {
    const card = document.createElement('div');
    card.className = 'card card-monster';
    card.dataset.id = monster.id;

    const levelClass = monster.isBoss ? ' boss' : '';
    const levelText = monster.level > 0 ? `Lv.${monster.level}` : '';

    const mFav = Favorites.has('monsters', monster.id);
    card.innerHTML = `
      ${monster.isBoss ? '<span class="badge badge-boss">BOSS</span>' : ''}
      <button class="fav-btn${mFav ? ' fav-btn--active' : ''}" data-type="monsters" data-id="${monster.id}" title="${mFav ? I18n.t('favorites.remove') : I18n.t('favorites.add')}">
        ${Favorites.starSVG(mFav)}
      </button>
      <div class="card-img">
        <img src="${Utils.monsterImg(monster)}" alt="${Utils.escapeHTML(I18n.name(monster))}" loading="lazy">
      </div>
      <div class="card-info">
        <div class="card-name">${Utils.escapeHTML(I18n.name(monster))}</div>
        <div class="card-meta">
          ${levelText ? `<span class="card-level${levelClass}">${levelText}</span>` : ''}
          ${monster.hp > 0 ? `<span class="card-hp">HP ${Utils.formatNumber(monster.hp)}</span>` : ''}
        </div>
      </div>
    `;

    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Favorites.toggle('monsters', monster.id);
    });

    card.addEventListener('click', () => {
      Router.navigate({ monsterId: monster.id });
    });

    return card;
  }

  function updateMonsterCount() {
    const el = document.getElementById('monster-count');
    if (!el) return;
    const s = state.monsters;
    el.textContent = I18n.t('count.showing', {
      shown: s.rendered,
      total: s.filtered.length
    });
  }

  // === Items ===

  function renderItems() {
    const s = state.items;
    const query = Search.getItemQuery();
    s.rendered = 0;

    const body = document.getElementById('item-body');
    if (body.dataset.mode === 'detail') return;
    body.dataset.mode = 'list';
    body.innerHTML = '';

    // #8: show prompt when no filters and no search
    if (!Filters.hasActiveItemFilters() && !query) {
      const prompt = document.createElement('div');
      prompt.className = 'empty-prompt';
      prompt.textContent = I18n.t('empty.itemPrompt');
      body.appendChild(prompt);
      updateItemCount();
      return;
    }

    s.filtered = Filters.applyItemFilters(query);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    grid.id = 'item-grid';
    body.appendChild(grid);

    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    body.appendChild(sentinel);

    appendItemBatch(grid);
    updateItemCount();
    setupObserver('items', body, sentinel, grid);
  }

  function appendItemBatch(grid) {
    const s = state.items;
    const end = Math.min(s.rendered + BATCH_SIZE, s.filtered.length);

    for (let i = s.rendered; i < end; i++) {
      grid.appendChild(createItemCard(s.filtered[i]));
    }
    s.rendered = end;
  }

  function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'card card-item';
    card.dataset.id = item.id;

    const catClass = Utils.categoryClass(item);
    const catLabel = I18n.t(Utils.categoryI18nKey(item));
    const reqLevel = item.requirements?.level;

    const iFav = Favorites.has('items', item.id);
    card.innerHTML = `
      <span class="badge badge-cat ${catClass}">${catLabel}</span>
      <button class="fav-btn${iFav ? ' fav-btn--active' : ''}" data-type="items" data-id="${item.id}" title="${iFav ? I18n.t('favorites.remove') : I18n.t('favorites.add')}">
        ${Favorites.starSVG(iFav)}
      </button>
      <div class="card-img">
        <img src="${Utils.itemImg(item)}" alt="${Utils.escapeHTML(I18n.name(item))}" loading="lazy">
      </div>
      <div class="card-info">
        <div class="card-name">${Utils.escapeHTML(I18n.name(item))}</div>
        <div class="card-meta">
          ${reqLevel ? `<span class="card-level">Lv.${reqLevel}</span>` : ''}
        </div>
      </div>
    `;

    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Favorites.toggle('items', item.id);
    });

    card.addEventListener('click', () => {
      Router.navigate({ itemId: item.id });
    });

    return card;
  }

  function updateItemCount() {
    const el = document.getElementById('item-count');
    if (!el) return;
    const s = state.items;
    el.textContent = I18n.t('count.showing', {
      shown: s.rendered,
      total: s.filtered.length
    });
  }

  // === Infinite Scroll ===

  function setupObserver(section, container, sentinel, grid) {
    const s = state[section];
    if (s.observer) s.observer.disconnect();

    s.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && s.rendered < s.filtered.length) {
        if (section === 'monsters') {
          appendMonsterBatch(grid);
          updateMonsterCount();
        } else {
          appendItemBatch(grid);
          updateItemCount();
        }
      }
    }, { root: container, rootMargin: '200px' });

    s.observer.observe(sentinel);
  }

  // === Public: switch back to list from detail ===

  function showMonsterList() {
    const body = document.getElementById('monster-body');
    body.dataset.mode = 'list';
    renderMonsters();
  }

  function showItemList() {
    const body = document.getElementById('item-body');
    body.dataset.mode = 'list';
    renderItems();
  }

  return {
    init, refresh,
    renderMonsters, renderItems,
    showMonsterList, showItemList,
  };
})();
