/* === RenderDetail: 怪物/道具詳細檢視（v2） === */

const RenderDetail = (() => {

  // === Monster Detail ===

  function showMonster(id) {
    const monster = Data.getMonster(id);
    if (!monster) return;

    const body = document.getElementById('monster-body');
    body.dataset.mode = 'detail';
    body.innerHTML = '';

    const view = document.createElement('div');
    view.className = 'detail-view';

    // Back button
    const back = document.createElement('div');
    back.className = 'detail-back';
    back.textContent = I18n.t('detail.back');
    back.addEventListener('click', () => {
      Router.navigate({ monsterId: null });
    });
    view.appendChild(back);

    // Header
    view.appendChild(buildMonsterHeader(monster));

    // Stats
    if (monster.level > 0) {
      view.appendChild(buildMonsterStats(monster));
    } else {
      const noData = document.createElement('p');
      noData.className = 'no-results';
      noData.textContent = I18n.t('detail.noData');
      view.appendChild(noData);
    }

    // #5: Buff type (weakness/resistance/immunity)
    if (monster.buffType?.length > 0) {
      view.appendChild(buildBuffTypeSection(monster));
    }

    // Maps
    if (monster.mapIds?.length > 0) {
      view.appendChild(buildMapSection(monster.mapIds));
    }

    // Drop Table (#6, #6-1, #6-2: card-based, grouped, qty=1 hidden)
    const drops = Data.getDropsByMonster(monster.id);
    if (drops.length > 0) {
      view.appendChild(buildMonsterDropCards(drops));
    }

    body.appendChild(view);
  }

  function buildMonsterHeader(monster) {
    const header = document.createElement('div');
    header.className = 'detail-header';

    const lang = I18n.getLang();
    const primaryName = I18n.name(monster);
    const secondaryName = lang === 'zh' ? (monster.name.en || '') : (monster.name.zh || '');
    const isFav = Favorites.has('monsters', monster.id);

    header.innerHTML = `
      <div class="detail-icon">
        <img src="${Utils.monsterImg(monster)}" alt="${Utils.escapeHTML(primaryName)}">
      </div>
      <div class="detail-title-group">
        <div class="detail-name">${Utils.escapeHTML(primaryName)}</div>
        ${secondaryName ? `<div class="detail-name-sub">${Utils.escapeHTML(secondaryName)}</div>` : ''}
        <div class="detail-id">ID: ${monster.id}${monster.isBoss ? ' <span class="badge badge-boss">BOSS</span>' : ''}</div>
      </div>
      <button class="fav-btn-detail${isFav ? ' fav-btn--active' : ''}" data-type="monsters" data-id="${monster.id}" title="${isFav ? I18n.t('favorites.remove') : I18n.t('favorites.add')}">
        ${Favorites.starSVG(isFav)}
      </button>
    `;

    header.querySelector('.fav-btn-detail').addEventListener('click', () => {
      Favorites.toggle('monsters', monster.id);
    });

    const handler = (e) => {
      if (e.detail.type === 'monsters' && e.detail.id === monster.id) {
        const btn = header.querySelector('.fav-btn-detail');
        if (!btn) { document.removeEventListener('favorites-changed', handler); return; }
        btn.classList.toggle('fav-btn--active', e.detail.isFav);
        btn.innerHTML = Favorites.starSVG(e.detail.isFav);
        btn.title = e.detail.isFav ? I18n.t('favorites.remove') : I18n.t('favorites.add');
      }
    };
    document.addEventListener('favorites-changed', handler);

    return header;
  }

  function buildMonsterStats(monster) {
    const grid = document.createElement('div');
    grid.className = 'stat-grid';

    const stats = [
      { label: I18n.t('detail.level'), value: monster.level, color: '' },
      { label: I18n.t('detail.hp'), value: Utils.formatNumber(monster.hp), color: 'var(--stat-hp)' },
      { label: I18n.t('detail.exp'), value: Utils.formatNumber(monster.exp), color: 'var(--stat-mp)' },
      { label: I18n.t('detail.acc'), value: monster.acc, color: 'var(--stat-acc)', key: 'acc' },
      { label: I18n.t('detail.avoid'), value: monster.avoid, color: 'var(--stat-avoid)', key: 'avoid' },
    ];

    for (const s of stats) {
      const item = document.createElement('div');
      item.className = 'stat-item';
      if (s.key) item.dataset.stat = s.key;
      item.innerHTML = `
        <div class="stat-label">${s.label}</div>
        <div class="stat-value" ${s.color ? `style="color:${s.color}"` : ''}>${s.value}</div>
      `;
      grid.appendChild(item);
    }

    if (typeof HitCalc !== 'undefined') {
      HitCalc.attachTo(grid, monster);
    }

    return grid;
  }

  // #5: Buff type section
  function buildBuffTypeSection(monster) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('filter.element');
    section.appendChild(title);

    // Categorize buffTypes
    const groups = { weakness: [], resistance: [], immunity: [] };
    for (const bt of monster.buffType) {
      if (bt.includes('弱點')) groups.weakness.push(bt);
      else if (bt.includes('抵抗')) groups.resistance.push(bt);
      else if (bt.includes('免疫')) groups.immunity.push(bt);
      else groups.weakness.push(bt); // fallback
    }

    const ELEMENT_COLORS = {
      '火': '#ef4444', '冰': '#60a5fa', '雷': '#eab308',
      '毒': '#22c55e', '治療': '#f472b6', '神聖': '#e2e8f0',
    };

    function getElementColor(bt) {
      for (const [key, color] of Object.entries(ELEMENT_COLORS)) {
        if (bt.includes(key)) return color;
      }
      return 'var(--text-secondary)';
    }

    const container = document.createElement('div');
    container.className = 'buff-type-container';

    for (const [groupKey, items] of Object.entries(groups)) {
      if (items.length === 0) continue;
      const groupDiv = document.createElement('div');
      groupDiv.className = 'buff-type-group';

      const label = document.createElement('span');
      label.className = 'buff-type-label';
      label.textContent = I18n.t('detail.' + groupKey);
      groupDiv.appendChild(label);

      for (const bt of items) {
        const tag = document.createElement('span');
        tag.className = 'buff-type-tag';
        tag.style.borderColor = getElementColor(bt);
        tag.style.color = getElementColor(bt);
        tag.textContent = Filters.getBuffTypeDisplay(bt);
        groupDiv.appendChild(tag);
      }
      container.appendChild(groupDiv);
    }

    section.appendChild(container);
    return section;
  }

  function buildMapSection(mapIds) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.maps');
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'map-list';

    for (const mapId of mapIds) {
      const map = Data.getMap(mapId);
      if (!map) continue;

      const tag = document.createElement('span');
      tag.className = 'map-tag';
      tag.innerHTML = `${Utils.escapeHTML(I18n.name(map))}${map.region ? `<span class="map-region">(${Utils.escapeHTML(map.region)})</span>` : ''}`;
      list.appendChild(tag);
    }

    section.appendChild(list);
    return section;
  }

  // #6, #6-1, #6-2: Drop cards grouped by category
  function buildMonsterDropCards(drops) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.drops');
    section.appendChild(title);

    // Group drops by category
    const groups = { meso: [], scroll: [], equip: [], consume: [], other: [] };

    for (const drop of drops) {
      if (drop.itemId === 0) {
        groups.meso.push(drop);
      } else {
        const item = Data.getItem(drop.itemId);
        if (!item) { groups.other.push(drop); continue; }
        if (item.type === 'equip') groups.equip.push(drop);
        else if (item.category === 'scroll') groups.scroll.push(drop);
        else if (item.category === 'consumable') groups.consume.push(drop);
        else groups.other.push(drop);
      }
    }

    const ORDER = ['meso', 'scroll', 'equip', 'consume', 'other'];
    for (const key of ORDER) {
      const groupDrops = groups[key];
      if (groupDrops.length === 0) continue;

      const groupLabel = document.createElement('div');
      groupLabel.className = 'drop-group-label';
      groupLabel.textContent = I18n.t('detail.dropGroup.' + key);
      section.appendChild(groupLabel);

      const grid = document.createElement('div');
      grid.className = 'drop-card-grid';

      for (const drop of groupDrops) {
        grid.appendChild(createDropCard(drop, 'item'));
      }
      section.appendChild(grid);
    }

    return section;
  }

  function createDropCard(drop, type) {
    const card = document.createElement('div');
    card.className = 'drop-card';

    let imgSrc = '';
    let name = '';
    let navigateId = null;

    if (type === 'item') {
      if (drop.itemId === 0) {
        imgSrc = 'images/items/img_0.png';
        name = I18n.t('detail.meso');
      } else {
        const item = Data.getItem(drop.itemId);
        imgSrc = item ? Utils.itemImg(item) : '';
        name = item ? I18n.name(item) : `#${drop.itemId}`;
        navigateId = drop.itemId;
      }
    } else {
      // type === 'monster'
      const monster = Data.getMonster(drop.monsterId);
      if (!monster) return card;
      imgSrc = Utils.monsterImg(monster);
      name = I18n.name(monster);
      navigateId = drop.monsterId;
    }

    // #6-2: quantity — only show if not "1"
    const qtyStr = Utils.formatQuantity(drop.quantity);
    const showQty = qtyStr !== '1';

    card.innerHTML = `
      ${imgSrc ? `<img class="drop-card-icon" src="${imgSrc}" alt="">` : ''}
      <span class="drop-card-name">${Utils.escapeHTML(name)}</span>
      <span class="drop-card-rate">${Utils.formatRate(drop.rate)}</span>
      ${showQty ? `<span class="drop-card-qty">x${qtyStr}</span>` : ''}
    `;

    if (navigateId != null) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (type === 'item') Router.navigate({ itemId: navigateId });
        else Router.navigate({ monsterId: navigateId });
      });
    }

    return card;
  }

  // === Item Detail ===

  function showItem(id) {
    const item = Data.getItem(id);
    if (!item) return;

    const body = document.getElementById('item-body');
    body.dataset.mode = 'detail';
    body.innerHTML = '';

    const view = document.createElement('div');
    view.className = 'detail-view';

    // Back button
    const back = document.createElement('div');
    back.className = 'detail-back';
    back.textContent = I18n.t('detail.back');
    back.addEventListener('click', () => {
      Router.navigate({ itemId: null });
    });
    view.appendChild(back);

    // Header
    view.appendChild(buildItemHeader(item));

    // Requirements (equip only)
    if (item.requirements) {
      view.appendChild(buildRequirements(item));
    }

    // Stats (equip only)
    if (item.stats) {
      view.appendChild(buildItemStats(item));
    }

    // TUC
    if (item.tuc != null) {
      const tucSection = document.createElement('div');
      tucSection.className = 'detail-section';
      const tucTitle = document.createElement('div');
      tucTitle.className = 'detail-section-title';
      tucTitle.textContent = I18n.t('detail.tuc');
      tucSection.appendChild(tucTitle);
      const tucVal = document.createElement('div');
      tucVal.className = 'stat-value';
      tucVal.textContent = item.tuc;
      tucSection.appendChild(tucVal);
      view.appendChild(tucSection);
    }

    // Scroll effect
    if (item.scroll) {
      view.appendChild(buildScrollEffect(item));
    }

    // Consumable effect
    if (item.effect) {
      view.appendChild(buildConsumableEffect(item));
    }

    // Dropped by (#6: card-based)
    const drops = Data.getDropsByItem(item.id);
    if (drops.length > 0) {
      view.appendChild(buildDroppedByCards(drops));
    }

    // Gacha sources (#10: fix name display)
    const gachaSources = Data.getGachaByItem(item.id);
    if (gachaSources.length > 0) {
      view.appendChild(buildGachaSourceSection(gachaSources));
    }

    // No sources at all
    if (drops.length === 0 && gachaSources.length === 0) {
      const noSource = document.createElement('div');
      noSource.className = 'detail-section';
      const noTitle = document.createElement('div');
      noTitle.className = 'detail-section-title';
      noTitle.textContent = I18n.t('detail.droppedBy');
      noSource.appendChild(noTitle);
      const noText = document.createElement('p');
      noText.className = 'no-results';
      noText.textContent = I18n.t('detail.noDropSource');
      noSource.appendChild(noText);
      view.appendChild(noSource);
    }

    body.appendChild(view);
  }

  function buildItemHeader(item) {
    const header = document.createElement('div');
    header.className = 'detail-header';

    const lang = I18n.getLang();
    const primaryName = I18n.name(item);
    const secondaryName = lang === 'zh' ? (item.name.en || '') : (item.name.zh || '');
    const catLabel = I18n.t(Utils.categoryI18nKey(item));
    const catClass = Utils.categoryClass(item);
    const isFav = Favorites.has('items', item.id);

    header.innerHTML = `
      <div class="detail-icon">
        <img src="${Utils.itemImg(item)}" alt="${Utils.escapeHTML(primaryName)}">
      </div>
      <div class="detail-title-group">
        <div class="detail-name">${Utils.escapeHTML(primaryName)}</div>
        ${secondaryName ? `<div class="detail-name-sub">${Utils.escapeHTML(secondaryName)}</div>` : ''}
        <div class="detail-id">
          ID: ${item.id}
          <span class="badge badge-cat ${catClass}" style="margin-left:8px;">${catLabel}</span>
          ${item.subCategory ? `<span style="color:var(--text-muted);margin-left:4px;font-size:var(--font-xs);">${item.subCategory}</span>` : ''}
        </div>
      </div>
      <button class="fav-btn-detail${isFav ? ' fav-btn--active' : ''}" data-type="items" data-id="${item.id}" title="${isFav ? I18n.t('favorites.remove') : I18n.t('favorites.add')}">
        ${Favorites.starSVG(isFav)}
      </button>
    `;

    header.querySelector('.fav-btn-detail').addEventListener('click', () => {
      Favorites.toggle('items', item.id);
    });

    const handler = (e) => {
      if (e.detail.type === 'items' && e.detail.id === item.id) {
        const btn = header.querySelector('.fav-btn-detail');
        if (!btn) { document.removeEventListener('favorites-changed', handler); return; }
        btn.classList.toggle('fav-btn--active', e.detail.isFav);
        btn.innerHTML = Favorites.starSVG(e.detail.isFav);
        btn.title = e.detail.isFav ? I18n.t('favorites.remove') : I18n.t('favorites.add');
      }
    };
    document.addEventListener('favorites-changed', handler);

    return header;
  }

  function buildRequirements(item) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.requirements');
    section.appendChild(title);

    // #16: Use stat-grid layout for uniform sizing
    const grid = document.createElement('div');
    grid.className = 'stat-grid';

    const req = item.requirements;

    if (req.level) {
      const el = document.createElement('div');
      el.className = 'stat-item';
      el.innerHTML = `<div class="stat-label">${I18n.t('detail.level')}</div><div class="stat-value">${req.level}</div>`;
      grid.appendChild(el);
    }

    for (const key of ['str', 'dex', 'int', 'luk']) {
      if (req[key]) {
        const el = document.createElement('div');
        el.className = 'stat-item';
        el.innerHTML = `<div class="stat-label">${I18n.t('stat.' + key)}</div><div class="stat-value" style="color:${Utils.statColor(key)}">${req[key]}</div>`;
        grid.appendChild(el);
      }
    }

    section.appendChild(grid);

    // Job badges with spacing
    if (req.job?.length > 0) {
      const jobHtml = document.createElement('div');
      jobHtml.className = 'job-badges';
      jobHtml.style.marginTop = 'var(--space-md)';
      for (const j of req.job) {
        const badge = document.createElement('span');
        badge.className = 'job-badge';
        badge.textContent = I18n.t('job.' + j);
        jobHtml.appendChild(badge);
      }
      section.appendChild(jobHtml);
    }

    return section;
  }

  function buildItemStats(item) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.stats');
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'stat-grid';

    for (const [key, val] of Object.entries(item.stats)) {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';
      statItem.innerHTML = `
        <div class="stat-label">${I18n.t('stat.' + key)}</div>
        <div class="stat-value" style="color:${Utils.statColor(key)}">${Utils.formatStat(val)}</div>
      `;
      grid.appendChild(statItem);
    }

    section.appendChild(grid);
    return section;
  }

  function buildScrollEffect(item) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.scrollEffect');
    section.appendChild(title);

    const info = document.createElement('div');
    info.className = 'stat-grid';
    info.style.marginBottom = 'var(--space-md)';

    if (item.scroll.target) {
      const el = document.createElement('div');
      el.className = 'stat-item';
      el.innerHTML = `<div class="stat-label">${I18n.t('detail.target')}</div><div class="stat-value">${I18n.t('subCat.' + item.scroll.target) || item.scroll.target}</div>`;
      info.appendChild(el);
    }
    if (item.scroll.successRate != null) {
      const el = document.createElement('div');
      el.className = 'stat-item';
      el.innerHTML = `<div class="stat-label">${I18n.t('detail.successRate')}</div><div class="stat-value">${Utils.formatRate(item.scroll.successRate)}</div>`;
      info.appendChild(el);
    }
    if (item.scroll.exchangeRate != null) {
      const el = document.createElement('div');
      el.className = 'stat-item';
      const displayVal = item.scroll.exchangeRate === 0
        ? I18n.t('detail.notDecomposable')
        : item.scroll.exchangeRate;
      el.innerHTML = `<div class="stat-label">${I18n.t('detail.exchangeRate')}</div><div class="stat-value">${displayVal}</div>`;
      info.appendChild(el);
    }
    if (item.scroll.voucherCost != null) {
      const el = document.createElement('div');
      el.className = 'stat-item';
      const displayVal = item.scroll.voucherCost === 0
        ? I18n.t('detail.notAvailable')
        : item.scroll.voucherCost;
      el.innerHTML = `<div class="stat-label">${I18n.t('detail.voucherCost')}</div><div class="stat-value">${displayVal}</div>`;
      info.appendChild(el);
    }
    section.appendChild(info);

    if (item.scroll.stats) {
      const effects = document.createElement('div');
      effects.className = 'effect-list';
      for (const [key, val] of Object.entries(item.scroll.stats)) {
        const eff = document.createElement('div');
        eff.className = 'effect-item';
        eff.innerHTML = `<span style="color:${Utils.statColor(key)}">${I18n.t('stat.' + key)}</span> +${val}`;
        effects.appendChild(eff);
      }
      section.appendChild(effects);
    }

    return section;
  }

  function buildConsumableEffect(item) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.effect');
    section.appendChild(title);

    const effects = document.createElement('div');
    effects.className = 'effect-list';

    for (const [key, val] of Object.entries(item.effect)) {
      if (key === 'cure' && Array.isArray(val)) {
        for (const c of val) {
          const eff = document.createElement('div');
          eff.className = 'effect-item';
          eff.textContent = `Cure: ${c}`;
          effects.appendChild(eff);
        }
      } else if (key === 'breathUnderwater') {
        const eff = document.createElement('div');
        eff.className = 'effect-item';
        eff.textContent = `Breathe Underwater: ${val}s`;
        effects.appendChild(eff);
      } else {
        const eff = document.createElement('div');
        eff.className = 'effect-item';
        const label = I18n.t('stat.' + key);
        eff.innerHTML = `<span style="color:${Utils.statColor(key)}">${label}</span> +${val}`;
        effects.appendChild(eff);
      }
    }

    section.appendChild(effects);
    return section;
  }

  // #6: Dropped-by as cards
  function buildDroppedByCards(drops) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.droppedBy');
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'drop-card-grid';

    for (const drop of drops) {
      grid.appendChild(createDropCard(drop, 'monster'));
    }

    section.appendChild(grid);
    return section;
  }

  // #10: Fix gacha source name display
  function buildGachaSourceSection(gachaSources) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    const title = document.createElement('div');
    title.className = 'detail-section-title';
    title.textContent = I18n.t('detail.gachaSource');
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'gacha-source-list';

    for (const src of gachaSources) {
      const item = document.createElement('div');
      item.className = 'gacha-source-item';
      // src.gachaName is {zh, en} directly, not {name: {zh, en}}
      const gachaDisplayName = src.gachaName[I18n.getLang()] || src.gachaName.zh || '';
      item.innerHTML = `
        <span>${Utils.escapeHTML(gachaDisplayName)}</span>
        <span class="gacha-item-rate">${Utils.formatRate(src.rate)}</span>
      `;
      item.addEventListener('click', () => {
        Router.navigate({ page: 'gacha', gachaId: src.gachaId });
      });
      list.appendChild(item);
    }

    section.appendChild(list);
    return section;
  }

  return { showMonster, showItem };
})();
