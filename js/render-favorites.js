/* === RenderFavorites: 收藏頁面 === */

const RenderFavorites = (() => {

  function init() {
    document.addEventListener('favorites-changed', () => {
      if (App.getCurrentPage() === 'favorites') {
        render();
      }
    });
  }

  function refresh() {
    render();
  }

  function render() {
    const container = document.getElementById('favorites-container');
    if (!container) return;
    container.innerHTML = '';

    // Page title
    const title = document.createElement('h2');
    title.className = 'favorites-page-title';
    title.textContent = I18n.t('favorites.title');
    container.appendChild(title);

    const monsterIds = Favorites.getAll('monsters');
    const itemIds = Favorites.getAll('items');

    // Empty state
    if (monsterIds.length === 0 && itemIds.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = I18n.t('favorites.empty');
      container.appendChild(empty);
      return;
    }

    // Monsters section
    if (monsterIds.length > 0) {
      container.appendChild(buildSection('monsters', monsterIds));
    }

    // Items section
    if (itemIds.length > 0) {
      container.appendChild(buildSection('items', itemIds));
    }
  }

  function buildSection(type, ids) {
    const section = document.createElement('div');
    section.className = 'favorites-section';

    const heading = document.createElement('h3');
    heading.className = 'favorites-section-title';
    heading.textContent = I18n.t(type === 'monsters' ? 'section.monsters' : 'section.items');

    const countSpan = document.createElement('span');
    countSpan.className = 'favorites-section-count';
    countSpan.textContent = ` (${ids.length})`;
    heading.appendChild(countSpan);
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'card-grid ' + (type === 'monsters' ? 'fav-monster-grid' : 'fav-item-grid');

    for (const id of ids) {
      if (type === 'monsters') {
        const monster = Data.getMonster(id);
        if (!monster) continue;
        grid.appendChild(createFavMonsterCard(monster));
      } else {
        const item = Data.getItem(id);
        if (!item) continue;
        grid.appendChild(createFavItemCard(item));
      }
    }

    section.appendChild(grid);
    return section;
  }

  function createFavMonsterCard(monster) {
    const card = document.createElement('div');
    card.className = 'card card-monster';
    card.dataset.id = monster.id;

    const levelText = monster.level > 0 ? `Lv.${monster.level}` : '';
    const levelClass = monster.isBoss ? ' boss' : '';

    card.innerHTML = `
      ${monster.isBoss ? '<span class="badge badge-boss">BOSS</span>' : ''}
      <button class="fav-btn fav-btn--active" data-type="monsters" data-id="${monster.id}" title="${I18n.t('favorites.remove')}">
        ${Favorites.starSVG(true)}
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
      Router.navigate({ page: 'encyclopedia', monsterId: monster.id });
    });

    return card;
  }

  function createFavItemCard(item) {
    const card = document.createElement('div');
    card.className = 'card card-item';
    card.dataset.id = item.id;

    const catClass = Utils.categoryClass(item);
    const catLabel = I18n.t(Utils.categoryI18nKey(item));
    const reqLevel = item.requirements?.level;

    card.innerHTML = `
      <span class="badge badge-cat ${catClass}">${catLabel}</span>
      <button class="fav-btn fav-btn--active" data-type="items" data-id="${item.id}" title="${I18n.t('favorites.remove')}">
        ${Favorites.starSVG(true)}
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
      Router.navigate({ page: 'encyclopedia', itemId: item.id });
    });

    return card;
  }

  return { init, refresh, render };
})();
