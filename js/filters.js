/* === Filters: 篩選狀態管理與 UI（v3 — 下拉面板、地區分組、屬性分組） === */

const Filters = (() => {
  // Monster filter state
  const monsterState = {
    levelRange: null,     // null = all, or [min, max]
    levelCustom: null,    // null = off, or {min, max}
    bossOnly: null,       // null = all, true = boss, false = normal
    regions: [],          // multi-select region names (OR)
    elements: [],         // multi-select buffType strings (OR)
  };

  // Item filter state
  const itemState = {
    category: null,
    subCategory: null,
    job: null,
    levelRange: null,
    levelCustom: null,
    scrollRate: null,
    scrollTarget: null,
    scrollStat: null,
  };

  const MONSTER_LEVELS = [
    { label: '1-10', min: 1, max: 10 },
    { label: '11-30', min: 11, max: 30 },
    { label: '31-50', min: 31, max: 50 },
    { label: '51-70', min: 51, max: 70 },
    { label: '71-100', min: 71, max: 100 },
    { label: '101-150', min: 101, max: 150 },
    { label: '151-200', min: 151, max: 200 },
    { label: '201+', min: 201, max: 300 },
  ];

  const ITEM_LEVELS = [
    { label: '0-10', min: 0, max: 10 },
    { label: '11-30', min: 11, max: 30 },
    { label: '31-50', min: 31, max: 50 },
    { label: '51-70', min: 51, max: 70 },
    { label: '71-100', min: 71, max: 100 },
    { label: '101-150', min: 101, max: 150 },
    { label: '151+', min: 151, max: 300 },
  ];

  const ITEM_CATEGORIES = [
    { key: 'equip', i18n: 'filter.equip', match: (item) => item.type === 'equip' },
    { key: 'consume', i18n: 'filter.consume', match: (item) => item.category === 'consumable' },
    { key: 'scroll', i18n: 'filter.scroll', match: (item) => item.category === 'scroll' },
    { key: 'material', i18n: 'filter.material', match: (item) =>
      (item.category === 'crafting') ||
      (item.category === 'other' && !['quest', 'questItem'].includes(item.subCategory))
    },
    { key: 'quest', i18n: 'filter.quest', match: (item) =>
      item.category === 'other' && ['quest', 'questItem'].includes(item.subCategory)
    },
    { key: 'cash', i18n: 'filter.cash', match: (item) => item.category === 'cash' },
  ];

  const JOBS = ['beginner', 'warrior', 'magician', 'bowman', 'thief', 'pirate'];

  // #9-2: Weapon order updated
  const EQUIP_GROUPS = {
    armor: ['hat', 'top', 'bottom', 'overall', 'shoes', 'gloves', 'shield', 'cape'],
    weapon: [
      'oneHandedSword', 'oneHandedAxe', 'oneHandedBlunt',
      'twoHandedSword', 'twoHandedAxe', 'twoHandedBlunt',
      'spear', 'polearm', 'wand', 'staff', 'dagger',
      'claw', 'bow', 'crossbow', 'knuckle', 'gun', 'projectile'
    ],
    accessory: ['earrings', 'ring', 'belt', 'faceAccessory', 'eyeAccessory', 'pendant'],
  };

  const SCROLL_RATES = [
    { label: '100%', value: 1 },
    { label: '70%', value: 0.7 },
    { label: '60%', value: 0.6 },
    { label: '30%', value: 0.3 },
    { label: '15%', value: 0.15 },
    { label: '10%', value: 0.1 },
  ];

  // #10-1: Scroll stat order
  const STAT_ORDER = [
    'attack', 'magicAttack', 'str', 'dex', 'int', 'luk',
    'acc', 'avoid', 'hp', 'mp', 'weaponDef', 'magicDef', 'speed', 'jump'
  ];

  // #5-1: Region order — groups in same row share a filter-tag-row
  const REGION_ROWS = [
    { groups: [{ parent: '維多利亞島', children: ['維多利亞港', '勇士之村', '魔法森林', '弓箭手村', '墮落城市', '鯨魚號', '奇幻村', '黃金海岸'] }] },
    { groups: [
      { parent: '路德斯湖', children: ['玩具城', '地球防衛本部', '童話村'] },
      { parent: '冰原雪域山脈', children: ['天空之城', '冰原雪域'] },
    ]},
    { groups: [
      { parent: null, children: ['水世界'] },
      { parent: null, children: ['米納爾森林'] },
      { parent: null, children: ['隱藏街道'] },
      { parent: null, children: ['楓之島'] },
    ]},
  ];

  // #5-2: Attribute display name mapping & groups
  const BUFFTYPE_DISPLAY_MAP = {
    '免疫冰凍狀態免疫': '冰凍', '免疫毒狀態免疫': '毒', '免疫燃燒狀態免疫': '燃燒',
    '冰弱點': '冰', '火弱點': '火', '毒弱點': '毒', '雷弱點': '雷', '神聖弱點': '聖',
    '治療弱點': '可治癒',
    '冰抵抗': '冰', '火抵抗': '火', '毒抵抗': '毒', '雷抵抗': '雷', '神聖抵抗': '聖',
  };

  const BUFFTYPE_GROUPS = [
    { key: 'immunity', i18n: 'filter.immunity', items: ['免疫冰凍狀態免疫', '免疫毒狀態免疫', '免疫燃燒狀態免疫'] },
    { key: 'weakness', i18n: 'filter.weakness', items: ['冰弱點', '火弱點', '毒弱點', '雷弱點', '神聖弱點', '治療弱點'] },
    { key: 'resistance', i18n: 'filter.resistance', items: ['冰抵抗', '火抵抗', '毒抵抗', '雷抵抗', '神聖抵抗'] },
  ];

  function init() {
    initDropdownToggle('monster-filter-toggle', 'monster-filters');
    initDropdownToggle('item-filter-toggle', 'item-filters');
    render();
  }

  function render() {
    renderMonsterFilters();
    renderItemFilters();
  }

  // ===================== Dropdown Toggle =====================

  function initDropdownToggle(btnId, dropdownId) {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close the other dropdown
      document.querySelectorAll('.filter-dropdown.open').forEach(dd => {
        if (dd.id !== dropdownId) dd.classList.remove('open');
      });
      dropdown.classList.toggle('open');
      // Position dropdown below panel-header (desktop floating)
      if (dropdown.classList.contains('open')) {
        const header = dropdown.parentElement.querySelector('.panel-header');
        if (header) dropdown.style.top = header.offsetHeight + 'px';
      }
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.remove('open');
      }
    });
  }

  function updateToggleBtn(btnId, hasFilters) {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.toggle('has-filters', hasFilters);
  }

  // ===================== Filter Section Helper =====================

  function createFilterSection(label) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    const labelEl = document.createElement('div');
    labelEl.className = 'filter-section-label';
    labelEl.textContent = label;
    section.appendChild(labelEl);
    const body = document.createElement('div');
    body.className = 'filter-section-body';
    section.appendChild(body);
    return { section, body };
  }

  function addTag(container, text, isActive, onClick) {
    const btn = document.createElement('button');
    btn.className = 'filter-tag' + (isActive ? ' active' : '');
    btn.textContent = text;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    container.appendChild(btn);
  }

  function addRangeInputs(container, stateObj, stateKey, maxBound, onChange) {
    const row = document.createElement('div');
    row.className = 'filter-range-row';

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'filter-range-input';
    minInput.placeholder = '0';
    minInput.min = 0;
    minInput.max = maxBound;
    if (stateObj[stateKey]?.min != null) minInput.value = stateObj[stateKey].min;

    const sep = document.createElement('span');
    sep.className = 'filter-range-sep';
    sep.textContent = '~';

    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'filter-range-input';
    maxInput.placeholder = String(maxBound);
    maxInput.min = 0;
    maxInput.max = maxBound;
    if (stateObj[stateKey]?.max != null) maxInput.value = stateObj[stateKey].max;

    const applyChange = () => {
      const min = minInput.value !== '' ? parseInt(minInput.value, 10) : null;
      const max = maxInput.value !== '' ? parseInt(maxInput.value, 10) : null;
      if (min != null || max != null) {
        stateObj[stateKey] = { min: min ?? 0, max: max ?? maxBound };
        stateObj.levelRange = null;
      } else {
        stateObj[stateKey] = null;
      }
      onChange();
    };

    minInput.addEventListener('change', applyChange);
    maxInput.addEventListener('change', applyChange);

    // Prevent clicks inside range row from closing the dropdown
    row.addEventListener('click', (e) => e.stopPropagation());

    row.appendChild(minInput);
    row.appendChild(sep);
    row.appendChild(maxInput);
    container.appendChild(row);
  }

  // ===================== Monster Filters =====================

  function renderMonsterFilters() {
    const container = document.getElementById('monster-filters');
    container.innerHTML = '';

    // Level
    const levelSec = createFilterSection(I18n.t('filter.levelRange'));
    const levelTagRow = document.createElement('div');
    levelTagRow.className = 'filter-tag-row';
    addTag(levelTagRow, I18n.t('filter.all'), monsterState.levelRange === null && !monsterState.levelCustom, () => {
      monsterState.levelRange = null;
      monsterState.levelCustom = null;
      onMonsterFilterChange();
    });
    for (const lr of MONSTER_LEVELS) {
      const isActive = monsterState.levelRange &&
        monsterState.levelRange[0] === lr.min && monsterState.levelRange[1] === lr.max;
      addTag(levelTagRow, lr.label, isActive, () => {
        monsterState.levelCustom = null;
        monsterState.levelRange = isActive ? null : [lr.min, lr.max];
        onMonsterFilterChange();
      });
    }
    // Wrap tags + range in single row for desktop inline layout
    const levelInline = document.createElement('div');
    levelInline.className = 'filter-level-row';
    levelInline.appendChild(levelTagRow);
    addRangeInputs(levelInline, monsterState, 'levelCustom', 300, onMonsterFilterChange);
    levelSec.body.appendChild(levelInline);
    container.appendChild(levelSec.section);

    // Type: Boss / Normal
    const typeSec = createFilterSection(I18n.t('filter.type'));
    const typeTagRow = document.createElement('div');
    typeTagRow.className = 'filter-tag-row';
    addTag(typeTagRow, I18n.t('filter.boss'), monsterState.bossOnly === true, () => {
      monsterState.bossOnly = monsterState.bossOnly === true ? null : true;
      onMonsterFilterChange();
    });
    addTag(typeTagRow, I18n.t('filter.normal'), monsterState.bossOnly === false, () => {
      monsterState.bossOnly = monsterState.bossOnly === false ? null : false;
      onMonsterFilterChange();
    });
    typeSec.body.appendChild(typeTagRow);
    container.appendChild(typeSec.section);

    // #5-1: Region (row-based grouping)
    const existingRegions = new Set(Data.getAllRegions());
    if (existingRegions.size > 0) {
      const regionSec = createFilterSection(I18n.t('filter.region'));

      let isFirstRow = true;
      for (const row of REGION_ROWS) {
        // Check if this row has any available regions
        const rowHasRegions = row.groups.some(g => g.children.some(r => existingRegions.has(r)));
        if (!rowHasRegions) continue;

        if (!isFirstRow) {
          const hr = document.createElement('hr');
          hr.style.cssText = 'border:none; border-top:1px solid var(--border); margin:var(--space-xs) 0;';
          regionSec.body.appendChild(hr);
        }
        isFirstRow = false;

        // Parent headers above the tag row
        const headers = row.groups.filter(g => g.parent && g.children.some(r => existingRegions.has(r)));
        if (headers.length > 0) {
          const headerRow = document.createElement('div');
          headerRow.className = 'filter-group-header';
          headerRow.textContent = headers.map(g => g.parent).join(' / ');
          regionSec.body.appendChild(headerRow);
        }

        // All groups in this row share one tag-row
        const tagRow = document.createElement('div');
        tagRow.className = 'filter-tag-row';
        let groupIdx = 0;
        for (const group of row.groups) {
          const available = group.children.filter(r => existingRegions.has(r));
          if (available.length === 0) continue;
          // Add separator between groups in same row
          if (groupIdx > 0) {
            const sep = document.createElement('span');
            sep.className = 'filter-tag-sep';
            sep.textContent = '|';
            tagRow.appendChild(sep);
          }
          for (const region of available) {
            addTag(tagRow, region, monsterState.regions.includes(region), () => {
              if (monsterState.regions.includes(region)) {
                monsterState.regions = monsterState.regions.filter(r => r !== region);
              } else {
                monsterState.regions = [...monsterState.regions, region];
              }
              onMonsterFilterChange();
            });
          }
          groupIdx++;
        }
        regionSec.body.appendChild(tagRow);
      }

      container.appendChild(regionSec.section);
    }

    // #5-2: Element / BuffType (all groups in one row)
    const allBuffTypes = new Set(Data.getAllBuffTypes());
    if (allBuffTypes.size > 0) {
      const elemSec = createFilterSection(I18n.t('filter.element'));
      const elemTagRow = document.createElement('div');
      elemTagRow.className = 'filter-tag-row';

      let groupIdx = 0;
      for (const group of BUFFTYPE_GROUPS) {
        const available = group.items.filter(bt => allBuffTypes.has(bt));
        if (available.length === 0) continue;

        // Inline group label
        if (groupIdx > 0) {
          const sep = document.createElement('span');
          sep.className = 'filter-tag-sep';
          sep.textContent = '|';
          elemTagRow.appendChild(sep);
        }
        const label = document.createElement('span');
        label.className = 'filter-tag-group-label';
        label.textContent = I18n.t(group.i18n);
        elemTagRow.appendChild(label);

        for (const bt of available) {
          const displayName = BUFFTYPE_DISPLAY_MAP[bt] || bt;
          addTag(elemTagRow, displayName, monsterState.elements.includes(bt), () => {
            if (monsterState.elements.includes(bt)) {
              monsterState.elements = monsterState.elements.filter(e => e !== bt);
            } else {
              monsterState.elements = [...monsterState.elements, bt];
            }
            onMonsterFilterChange();
          });
        }
        groupIdx++;
      }
      elemSec.body.appendChild(elemTagRow);
      container.appendChild(elemSec.section);
    }

    updateToggleBtn('monster-filter-toggle', hasActiveMonsterFilters());
  }

  // ===================== Item Filters =====================

  function renderItemFilters() {
    const container = document.getElementById('item-filters');
    container.innerHTML = '';

    // Category
    const catSec = createFilterSection(I18n.t('filter.category'));
    const catTagRow = document.createElement('div');
    catTagRow.className = 'filter-tag-row';
    addTag(catTagRow, I18n.t('filter.all'), itemState.category === null, () => {
      itemState.category = null;
      itemState.subCategory = null;
      itemState.job = null;
      itemState.levelRange = null;
      itemState.levelCustom = null;
      itemState.scrollRate = null;
      itemState.scrollTarget = null;
      itemState.scrollStat = null;
      onItemFilterChange();
    });
    for (const cat of ITEM_CATEGORIES) {
      addTag(catTagRow, I18n.t(cat.i18n), itemState.category === cat.key, () => {
        const wasEquip = itemState.category === 'equip';
        if (itemState.category === cat.key) {
          itemState.category = null;
        } else {
          itemState.category = cat.key;
        }
        itemState.subCategory = null;
        itemState.job = null;
        // #9: Clear level when leaving equip
        if (wasEquip || itemState.category !== 'equip') {
          itemState.levelRange = null;
          itemState.levelCustom = null;
        }
        itemState.scrollRate = null;
        itemState.scrollTarget = null;
        itemState.scrollStat = null;
        onItemFilterChange();
      });
    }
    catSec.body.appendChild(catTagRow);
    container.appendChild(catSec.section);

    // #9-1: Equip — Job first, then Level, then Sub-category
    if (itemState.category === 'equip') {
      // Job
      const jobSec = createFilterSection(I18n.t('filter.job'));
      const jobTagRow = document.createElement('div');
      jobTagRow.className = 'filter-tag-row';
      for (const job of JOBS) {
        addTag(jobTagRow, I18n.t('filter.' + job), itemState.job === job, () => {
          itemState.job = itemState.job === job ? null : job;
          onItemFilterChange();
        });
      }
      jobSec.body.appendChild(jobTagRow);
      container.appendChild(jobSec.section);

      // Level
      const levelSec = createFilterSection(I18n.t('filter.levelRange'));
      const itemLevelTagRow = document.createElement('div');
      itemLevelTagRow.className = 'filter-tag-row';
      for (const lr of ITEM_LEVELS) {
        const isActive = itemState.levelRange &&
          itemState.levelRange[0] === lr.min && itemState.levelRange[1] === lr.max;
        addTag(itemLevelTagRow, lr.label, isActive, () => {
          itemState.levelCustom = null;
          itemState.levelRange = isActive ? null : [lr.min, lr.max];
          onItemFilterChange();
        });
      }
      const itemLevelInline = document.createElement('div');
      itemLevelInline.className = 'filter-level-row';
      itemLevelInline.appendChild(itemLevelTagRow);
      addRangeInputs(itemLevelInline, itemState, 'levelCustom', 300, onItemFilterChange);
      levelSec.body.appendChild(itemLevelInline);
      container.appendChild(levelSec.section);

      // Sub-category (armor/weapon/accessory)
      const allSubs = getEquipSubCategories();
      for (const [groupKey, groupSubs] of Object.entries(EQUIP_GROUPS)) {
        const available = groupSubs.filter(s => allSubs.includes(s));
        if (available.length === 0) continue;

        const subSec = createFilterSection(I18n.t('filter.' + groupKey));
        const subTagRow = document.createElement('div');
        subTagRow.className = 'filter-tag-row';
        for (const sc of available) {
          const label = I18n.t('subCat.' + sc) || sc;
          addTag(subTagRow, label, itemState.subCategory === sc, () => {
            itemState.subCategory = itemState.subCategory === sc ? null : sc;
            onItemFilterChange();
          });
        }
        subSec.body.appendChild(subTagRow);
        container.appendChild(subSec.section);
      }
    }

    // Scroll-specific filters
    if (itemState.category === 'scroll') {
      // Success rate
      const rateSec = createFilterSection(I18n.t('filter.scrollRate'));
      const rateTagRow = document.createElement('div');
      rateTagRow.className = 'filter-tag-row';
      for (const sr of SCROLL_RATES) {
        const isActive = itemState.scrollRate === sr.value;
        addTag(rateTagRow, sr.label, isActive, () => {
          itemState.scrollRate = isActive ? null : sr.value;
          onItemFilterChange();
        });
      }
      rateSec.body.appendChild(rateTagRow);
      container.appendChild(rateSec.section);

      // #10: Target (grouped by armor/weapon/accessory)
      const allTargets = getScrollTargets();
      if (allTargets.length > 0) {
        const allTargetSet = new Set(allTargets);
        for (const [groupKey, groupSubs] of Object.entries(EQUIP_GROUPS)) {
          const available = groupSubs.filter(s => allTargetSet.has(s));
          if (available.length === 0) continue;
          const targetSec = createFilterSection(I18n.t('filter.' + groupKey));
          const targetTagRow = document.createElement('div');
          targetTagRow.className = 'filter-tag-row';
          for (const t of available) {
            const label = I18n.t('subCat.' + t) || t;
            addTag(targetTagRow, label, itemState.scrollTarget === t, () => {
              itemState.scrollTarget = itemState.scrollTarget === t ? null : t;
              onItemFilterChange();
            });
          }
          targetSec.body.appendChild(targetTagRow);
          container.appendChild(targetSec.section);
        }
        // Ungrouped targets fallback
        const groupedSet = new Set([...EQUIP_GROUPS.armor, ...EQUIP_GROUPS.weapon, ...EQUIP_GROUPS.accessory]);
        const ungrouped = allTargets.filter(t => !groupedSet.has(t));
        if (ungrouped.length > 0) {
          const otherSec = createFilterSection(I18n.t('filter.scrollTarget'));
          const otherTagRow = document.createElement('div');
          otherTagRow.className = 'filter-tag-row';
          for (const t of ungrouped) {
            const label = I18n.t('subCat.' + t) || t;
            addTag(otherTagRow, label, itemState.scrollTarget === t, () => {
              itemState.scrollTarget = itemState.scrollTarget === t ? null : t;
              onItemFilterChange();
            });
          }
          otherSec.body.appendChild(otherTagRow);
          container.appendChild(otherSec.section);
        }
      }

      // #10-1: Stat (ordered)
      const stats = getScrollStats();
      if (stats.length > 0) {
        const statSec = createFilterSection(I18n.t('filter.scrollStat'));
        const statTagRow = document.createElement('div');
        statTagRow.className = 'filter-tag-row';
        for (const s of stats) {
          const label = I18n.t('stat.' + s) || s;
          addTag(statTagRow, label, itemState.scrollStat === s, () => {
            itemState.scrollStat = itemState.scrollStat === s ? null : s;
            onItemFilterChange();
          });
        }
        statSec.body.appendChild(statTagRow);
        container.appendChild(statSec.section);
      }
    }

    updateToggleBtn('item-filter-toggle', hasActiveItemFilters());
  }

  // ===================== Data Helpers =====================

  function getEquipSubCategories() {
    const subs = new Set();
    for (const item of Data.getItemList()) {
      if (item.type === 'equip' && item.subCategory) {
        subs.add(item.subCategory);
      }
    }
    const allOrdered = [
      ...EQUIP_GROUPS.armor,
      ...EQUIP_GROUPS.weapon,
      ...EQUIP_GROUPS.accessory,
    ];
    return allOrdered.filter(s => subs.has(s));
  }

  // #10: Scroll targets ordered by equip groups
  function getScrollTargets() {
    const targets = new Set();
    for (const item of Data.getItemList()) {
      if (item.category === 'scroll' && item.scroll?.target) {
        targets.add(item.scroll.target);
      }
    }
    const ordered = [
      ...EQUIP_GROUPS.armor,
      ...EQUIP_GROUPS.weapon,
      ...EQUIP_GROUPS.accessory,
    ];
    const result = ordered.filter(t => targets.has(t));
    // Append any remaining targets not in ordered list
    for (const t of targets) {
      if (!result.includes(t)) result.push(t);
    }
    return result;
  }

  // #10-1: Scroll stats ordered
  function getScrollStats() {
    const stats = new Set();
    for (const item of Data.getItemList()) {
      if (item.category === 'scroll' && item.scroll?.stats) {
        Object.keys(item.scroll.stats).forEach(k => stats.add(k));
      }
    }
    const result = STAT_ORDER.filter(s => stats.has(s));
    // Append any remaining stats not in STAT_ORDER
    for (const s of stats) {
      if (!result.includes(s)) result.push(s);
    }
    return result;
  }

  // #5-2: Expose display name for render-detail
  function getBuffTypeDisplay(bt) {
    return BUFFTYPE_DISPLAY_MAP[bt] || bt;
  }

  // ===================== Filter Change =====================

  function onMonsterFilterChange() {
    renderMonsterFilters();
    RenderList.renderMonsters();
  }

  function onItemFilterChange() {
    App.showPanel('items'); // #3: Show item panel when filtering items
    renderItemFilters();
    RenderList.renderItems();
  }

  // ===================== Apply Filters =====================

  function hasActiveMonsterFilters() {
    return monsterState.levelRange !== null ||
      monsterState.levelCustom !== null ||
      monsterState.bossOnly !== null ||
      monsterState.regions.length > 0 ||
      monsterState.elements.length > 0;
  }

  function hasActiveItemFilters() {
    return itemState.category !== null ||
      itemState.subCategory !== null ||
      itemState.job !== null ||
      itemState.levelRange !== null ||
      itemState.levelCustom !== null ||
      itemState.scrollRate !== null ||
      itemState.scrollTarget !== null ||
      itemState.scrollStat !== null;
  }

  function applyMonsterFilters(searchQuery) {
    let list = Data.getMonsterList();

    if (monsterState.levelCustom) {
      const { min, max } = monsterState.levelCustom;
      list = list.filter(m => m.level >= min && m.level <= max);
    } else if (monsterState.levelRange) {
      const [min, max] = monsterState.levelRange;
      list = list.filter(m => m.level >= min && m.level <= max);
    }

    if (monsterState.bossOnly === true) {
      list = list.filter(m => m.isBoss);
    } else if (monsterState.bossOnly === false) {
      list = list.filter(m => !m.isBoss);
    }

    if (monsterState.regions.length > 0) {
      const ids = new Set();
      for (const region of monsterState.regions) {
        for (const id of Data.getMonstersByRegion(region)) {
          ids.add(id);
        }
      }
      list = list.filter(m => ids.has(m.id));
    }

    if (monsterState.elements.length > 0) {
      const ids = new Set();
      for (const bt of monsterState.elements) {
        for (const id of Data.getMonstersByBuffType(bt)) {
          ids.add(id);
        }
      }
      list = list.filter(m => ids.has(m.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.searchIndex && m.searchIndex.some(term => term.includes(q))
      );
    }

    return list;
  }

  function applyItemFilters(searchQuery) {
    let list = Data.getItemList();

    if (itemState.category) {
      const cat = ITEM_CATEGORIES.find(c => c.key === itemState.category);
      if (cat) list = list.filter(cat.match);
    }

    if (itemState.subCategory) {
      list = list.filter(i => i.subCategory === itemState.subCategory);
    }

    if (itemState.job) {
      if (itemState.job === 'beginner') {
        list = list.filter(i =>
          !i.requirements?.job || i.requirements.job.length === 0
        );
      } else {
        list = list.filter(i =>
          i.requirements?.job && i.requirements.job.includes(itemState.job)
        );
      }
    }

    if (itemState.levelCustom) {
      const { min, max } = itemState.levelCustom;
      list = list.filter(i => {
        const lvl = i.requirements?.level || 0;
        return lvl >= min && lvl <= max;
      });
    } else if (itemState.levelRange) {
      const [min, max] = itemState.levelRange;
      list = list.filter(i => {
        const lvl = i.requirements?.level || 0;
        return lvl >= min && lvl <= max;
      });
    }

    if (itemState.scrollRate != null) {
      list = list.filter(i => i.scroll?.successRate === itemState.scrollRate);
    }
    if (itemState.scrollTarget) {
      list = list.filter(i => i.scroll?.target === itemState.scrollTarget);
    }
    if (itemState.scrollStat) {
      list = list.filter(i => i.scroll?.stats && itemState.scrollStat in i.scroll.stats);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.searchIndex && i.searchIndex.some(term => term.includes(q))
      );
    }

    return list;
  }

  return {
    init, render,
    applyMonsterFilters, applyItemFilters,
    hasActiveMonsterFilters, hasActiveItemFilters,
    getBuffTypeDisplay,
  };
})();
