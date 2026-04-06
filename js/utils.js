/* === Utils: 格式化輔助函式 === */

const Utils = (() => {

  /** Format a decimal rate (0-1) as percentage string */
  function formatRate(rate) {
    if (rate == null) return '?';
    const pct = rate * 100;
    if (pct >= 1) {
      const s = pct.toFixed(1);
      return s.replace(/\.0$/, '') + '%';
    }
    if (pct >= 0.01) return pct.toFixed(2) + '%';
    return pct.toFixed(3) + '%';
  }

  /** Format a number with commas: 1234567 -> "1,234,567" */
  function formatNumber(n) {
    if (n == null) return '0';
    return n.toLocaleString();
  }

  /** Format quantity range: {min:1,max:1} -> "1", {min:4,max:6} -> "4~6" */
  function formatQuantity(q) {
    if (!q) return '1';
    if (q.min === q.max) return String(q.min);
    return `${q.min}~${q.max}`;
  }

  /** Format stat value: {base:35,max:53} -> "35~53", single number -> "5" */
  function formatStat(val) {
    if (val == null) return '0';
    if (typeof val === 'object' && val.base != null) {
      if (val.base === val.max) return String(val.base);
      return `${val.base}~${val.max}`;
    }
    return String(val);
  }

  /** Get image path for a monster */
  function monsterImg(monster) {
    return `images/monsters/${monster.icon}`;
  }

  /** Get image path for an item */
  function itemImg(item) {
    return `images/items/${item.icon}`;
  }

  /** Get CSS class for item category */
  function categoryClass(item) {
    if (item.category === 'scroll') return 'cat-scroll';
    if (item.category === 'consumable') return 'cat-use';
    if (item.category === 'cash') return 'cat-cash';
    if (item.type === 'equip') return 'cat-equip';
    return 'cat-etc';
  }

  /** Get category display label i18n key */
  function categoryI18nKey(item) {
    if (item.category === 'scroll') return 'filter.scroll';
    if (item.category === 'consumable') return 'filter.consume';
    if (item.category === 'cash') return 'filter.cash';
    if (item.category === 'crafting' || item.category === 'other') return 'filter.material';
    if (item.type === 'equip') return 'filter.equip';
    return 'filter.material';
  }

  /** Map stat key to color CSS variable name */
  function statColor(key) {
    const map = {
      str: 'var(--stat-str)',
      dex: 'var(--stat-dex)',
      int: 'var(--stat-int)',
      luk: 'var(--stat-luk)',
      hp: 'var(--stat-hp)',
      mp: 'var(--stat-mp)',
      attack: 'var(--stat-attack)',
      magicAttack: 'var(--stat-attack)',
      weaponDef: 'var(--stat-def)',
      magicDef: 'var(--stat-def)',
      acc: 'var(--stat-acc)',
      avoid: 'var(--stat-avoid)',
      speed: 'var(--stat-speed)',
      jump: 'var(--stat-speed)',
      attackSpeed: 'var(--stat-speed)',
    };
    return map[key] || 'var(--text-secondary)';
  }

  /** Debounce utility */
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /** Sanitize string for safe HTML insertion */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    formatRate, formatNumber, formatQuantity, formatStat,
    monsterImg, itemImg, categoryClass, categoryI18nKey,
    statColor, debounce, escapeHTML
  };
})();
