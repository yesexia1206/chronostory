/* === RenderGacha: 轉蛋機頁面（v3 — 手風琴機台 + 道具卡片） === */

const RenderGacha = (() => {
  let openMachineId = null;

  function init() {
    render();
  }

  function refresh() {
    render();
  }

  function render() {
    const container = document.getElementById('gacha-container');
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'gacha-page-title';
    title.textContent = I18n.t('gacha.title');
    container.appendChild(title);

    const gachas = Data.getGachas();
    const ids = Object.keys(gachas).sort((a, b) => Number(a) - Number(b));

    for (const id of ids) {
      const gacha = gachas[id];
      container.appendChild(createMachineAccordion(gacha));
    }
  }

  function createMachineAccordion(gacha) {
    const machine = document.createElement('div');
    machine.className = 'gacha-machine' + (openMachineId === gacha.id ? ' open' : '');

    // Header (click to toggle)
    const header = document.createElement('div');
    header.className = 'gacha-machine-header';
    header.innerHTML = `
      <div>
        <span class="gacha-machine-name">${Utils.escapeHTML(I18n.name(gacha))}</span>
        <span class="gacha-machine-count">${gacha.items.length} ${I18n.t('gacha.items')}</span>
      </div>
      <span class="gacha-machine-toggle">▼</span>
    `;
    header.addEventListener('click', () => {
      toggleMachine(gacha.id);
    });
    machine.appendChild(header);

    // Body (hidden by default, shown when open)
    const body = document.createElement('div');
    body.className = 'gacha-machine-body';

    // Search within machine
    const searchBox = document.createElement('div');
    searchBox.className = 'gacha-search-box';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'gacha-search-input';
    searchInput.placeholder = I18n.t('gacha.searchPlaceholder');
    searchInput.addEventListener('input', Utils.debounce(() => {
      renderMachineItems(body, gacha, searchInput.value.trim());
    }, 200));
    searchBox.appendChild(searchInput);
    body.appendChild(searchBox);

    // Item card grid container
    const grid = document.createElement('div');
    grid.className = 'gacha-item-card-grid';
    body.appendChild(grid);

    machine.appendChild(body);

    // Render items if open
    if (openMachineId === gacha.id) {
      renderMachineItems(body, gacha, '');
    }

    return machine;
  }

  function renderMachineItems(body, gacha, query) {
    const gridEl = body.querySelector('.gacha-item-card-grid');
    gridEl.innerHTML = '';

    let items = gacha.items
      .map(entry => ({
        ...entry,
        item: Data.getItem(entry.itemId),
      }))
      .sort((a, b) => b.rate - a.rate);

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(entry => {
        if (!entry.item) return false;
        return entry.item.searchIndex?.some(term => term.includes(q));
      });
    }

    if (items.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = I18n.t('search.noResults');
      gridEl.appendChild(noResults);
      return;
    }

    for (const entry of items) {
      const card = document.createElement('div');
      card.className = 'gacha-item-card';

      if (entry.item) {
        card.innerHTML = `
          <img src="${Utils.itemImg(entry.item)}" alt="" loading="lazy">
          <span class="gacha-item-card-name">${Utils.escapeHTML(I18n.name(entry.item))}</span>
          <span class="gacha-item-card-rate">${Utils.formatRate(entry.rate)}</span>
        `;
        card.addEventListener('click', () => {
          Router.navigate({ page: 'encyclopedia', itemId: entry.itemId });
        });
      } else {
        card.innerHTML = `
          <span style="width:36px;height:36px;"></span>
          <span class="gacha-item-card-name">#${entry.itemId}</span>
          <span class="gacha-item-card-rate">${Utils.formatRate(entry.rate)}</span>
        `;
      }

      gridEl.appendChild(card);
    }
  }

  function toggleMachine(id) {
    openMachineId = openMachineId === id ? null : id;
    render();
    if (openMachineId) {
      history.replaceState(null, '', `#gacha/${openMachineId}`);
    } else {
      history.replaceState(null, '', '#gacha');
    }
  }

  function openMachine(id) {
    openMachineId = id;
    render();
  }

  return { init, refresh, render, openMachine };
})();
