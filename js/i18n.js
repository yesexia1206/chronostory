/* === i18n: 中英雙語切換 === */

const I18n = (() => {
  let currentLang = localStorage.getItem('chronostory-lang') || 'zh';

  const translations = {
    zh: {
      // Navigation
      'nav.encyclopedia': '圖鑑',
      'nav.gacha': '轉蛋機',
      'nav.favorites': '收藏',

      // Info modal
      'info.title': '關於本站與參考資料',
      'info.official': '1. 官方文件',
      'info.websites': '2. 網頁（圖鑑、含小工具）',
      'info.paused': '（暫停更新）',
      'info.community': '3. DC 討論串相關連結',
      'info.disclaimer': '注意：部分資訊可能過舊，請斟酌參考',
      'info.skillChanges': '技能調整 — 中文版、連結與資訊頁',
      'info.faq': 'DC 指南中文 FAQ',
      'info.classGuides': '技改與配點建議（中文）',
      'info.warrior': '劍士',
      'info.magician': '法師',
      'info.bowman': '弓箭手',
      'info.thief': '盜賊',
      'info.pirate': '海盜',
      'info.updates': 'UPDATE — 中文翻譯',
      'info.lastUnwelcomeGuest': '不速之客相關',
      'info.zenomega': '黑金剛相關',
      'info.pianus': '海怒斯相關',
      'info.personal': '本站為我個人使用和備份用途，資料不保證最新和其正確性，內容如有誤請依遊戲內和官方為準。',
      'info.lastUpdatedLabel': '最後更新：',
      'info.feedbackLabel': '問題回報 / 建議表單：',
      'nav.about': '關於',

      // Sections
      'section.monsters': '怪物',
      'section.items': '道具',

      // Loading
      'loading': '載入中...',
      'loading.monsters': '載入怪物資料...',
      'loading.items': '載入道具資料...',
      'loading.drops': '載入掉落資料...',
      'loading.gacha': '載入轉蛋資料...',
      'loading.maps': '載入地圖資料...',
      'loading.indexing': '建立索引...',
      'loading.done': '載入完成！',

      // Search
      'search.placeholder': '搜尋怪物或道具...',
      'search.noResults': '找不到符合的結果',

      // Filters - Monster
      'filter.levelRange': '等級',
      'filter.type': '類型',
      'filter.boss': 'Boss',
      'filter.normal': '一般',
      'filter.all': '全部',

      // Filters - Item
      'filter.category': '分類',
      'filter.equip': '裝備',
      'filter.consume': '消耗品',
      'filter.scroll': '卷軸',
      'filter.material': '素材',
      'filter.cash': '時裝',
      'filter.job': '職業',
      'filter.warrior': '劍士',
      'filter.magician': '法師',
      'filter.bowman': '弓箭手',
      'filter.thief': '盜賊',
      'filter.pirate': '海盜',
      'filter.beginner': '初心者',
      'filter.region': '地區',
      'filter.element': '屬性',
      'filter.levelMin': '最低',
      'filter.levelMax': '最高',
      'filter.quest': '任務道具',
      'filter.armor': '防具',
      'filter.weapon': '武器',
      'filter.accessory': '飾品',
      'filter.scrollRate': '成功率',
      'filter.scrollTarget': '適用部位',
      'filter.scrollStat': '屬性',
      'filter.toggle': '篩選',
      'filter.immunity': '狀態免疫',
      'filter.weakness': '弱點',
      'filter.resistance': '抗性',
      'empty.monsterPrompt': '請選擇篩選條件或搜尋怪物',
      'empty.itemPrompt': '請選擇篩選條件或搜尋道具',

      // Sub categories
      // Armor
      'subCat.hat': '帽子',
      'subCat.top': '上衣',
      'subCat.bottom': '下衣',
      'subCat.overall': '套服',
      'subCat.shoes': '鞋子',
      'subCat.gloves': '手套',
      'subCat.shield': '盾牌',
      'subCat.cape': '披風',
      // Accessory
      'subCat.earrings': '耳環',
      'subCat.ring': '戒指',
      'subCat.belt': '腰帶',
      'subCat.faceAccessory': '臉飾',
      'subCat.eyeAccessory': '眼飾',
      'subCat.pendant': '墜飾',
      'subCat.accessory': '飾品',
      // Weapon
      'subCat.weapon': '武器',
      'subCat.oneHandedSword': '單手劍',
      'subCat.oneHandedAxe': '單手斧',
      'subCat.oneHandedBlunt': '單手棍',
      'subCat.dagger': '短劍',
      'subCat.wand': '短杖',
      'subCat.staff': '長杖',
      'subCat.twoHandedSword': '雙手劍',
      'subCat.twoHandedAxe': '雙手斧',
      'subCat.twoHandedBlunt': '雙手棍',
      'subCat.spear': '槍',
      'subCat.polearm': '矛',
      'subCat.bow': '弓',
      'subCat.crossbow': '弩',
      'subCat.claw': '拳套',
      'subCat.knuckle': '指虎',
      'subCat.gun': '火槍',
      'subCat.projectile': '投擲物',
      // Other
      'subCat.potion': '藥水',
      'subCat.consumable': '消耗品',
      'subCat.scroll': '卷軸',
      'subCat.monsterDrop': '怪物掉落',
      'subCat.quest': '任務道具',
      'subCat.questItem': '任務道具',
      'subCat.ore': '礦石',
      'subCat.mineralOre': '礦石原礦',
      'subCat.rareOre': '稀有礦石',
      'subCat.book': '書',
      'subCat.cosmetic': '時裝',

      // Detail
      'detail.back': '← 返回列表',
      'detail.level': '等級',
      'detail.hp': 'HP',
      'detail.exp': 'EXP',
      'detail.acc': '命中',
      'detail.avoid': '迴避',
      'detail.maps': '出沒地圖',
      'detail.drops': '掉落物品',
      'detail.meso': '楓幣',
      'detail.dropRate': '掉落率',
      'detail.quantity': '數量',
      'detail.requirements': '裝備需求',
      'detail.stats': '素質',
      'detail.scrollEffect': '卷軸效果',
      'detail.target': '適用',
      'detail.successRate': '成功率',
      'detail.exchangeRate': '分解數量',
      'detail.voucherCost': '兌換需求',
      'detail.notDecomposable': '不可分解',
      'detail.notAvailable': '尚未開放',
      'detail.effect': '效果',
      'detail.tuc': '可用卷軸次數',
      'detail.droppedBy': '掉落來源',
      'detail.gachaSource': '轉蛋來源',
      'detail.noDropSource': '無已知取得來源',
      'detail.noData': '資料待補',

      // Calculator
      'calc.toggle': '命中/迴避計算',
      'calc.playerLevel': '角色等級',
      'calc.playerHit': '角色命中',
      'calc.playerAvoid': '角色迴避',
      'calc.physical': '物理職業',
      'calc.mage': '法師',
      'calc.thief': '盜賊',
      'calc.hitRate': '命中率',
      'calc.dodgeRate': '迴避率',
      'calc.required100': '100%命中',

      // Detail - Drop groups
      'detail.dropGroup.meso': '楓幣',
      'detail.dropGroup.scroll': '卷軸',
      'detail.dropGroup.equip': '裝備',
      'detail.dropGroup.consume': '消耗品',
      'detail.dropGroup.other': '其他',
      // Detail - Buff types
      'detail.weakness': '弱點',
      'detail.resistance': '抵抗',
      'detail.immunity': '免疫',

      // Stats
      'stat.attack': '攻擊力',
      'stat.magicAttack': '魔法攻擊力',
      'stat.weaponDef': '物理防禦',
      'stat.magicDef': '魔法防禦',
      'stat.hp': 'HP',
      'stat.mp': 'MP',
      'stat.str': '力量',
      'stat.dex': '敏捷',
      'stat.int': '智力',
      'stat.luk': '幸運',
      'stat.acc': '命中',
      'stat.avoid': '迴避',
      'stat.speed': '移動速度',
      'stat.jump': '跳躍',
      'stat.attackSpeed': '攻擊速度',
      'stat.hpPercent': 'HP%',
      'stat.mpPercent': 'MP%',

      // Gacha
      'gacha.title': '轉蛋機',
      'gacha.items': '項目',
      'gacha.rate': '機率',
      'gacha.searchPlaceholder': '在轉蛋機內搜尋...',

      // Favorites
      'favorites.title': '我的收藏',
      'favorites.empty': '尚未收藏任何怪物或道具',
      'favorites.add': '加入收藏',
      'favorites.remove': '取消收藏',

      // Jobs
      'job.warrior': '劍士',
      'job.magician': '法師',
      'job.bowman': '弓箭手',
      'job.thief': '盜賊',
      'job.pirate': '海盜',
      'job.beginner': '初心者',

      // Misc
      'count.showing': '顯示 {shown} / {total}',
      'count.filtered': '{count} 筆結果',
    },

    en: {
      'nav.encyclopedia': 'Encyclopedia',
      'nav.gacha': 'Gacha',
      'nav.favorites': 'Favorites',

      // Info modal
      'info.title': 'About & References',
      'info.official': '1. Official Documents',
      'info.websites': '2. Websites (Database & Tools)',
      'info.paused': '(No longer updated)',
      'info.community': '3. Discord Community Links',
      'info.disclaimer': 'Note: Some info may be outdated. Use with discretion.',
      'info.skillChanges': 'Skill Changes — Chinese ver.',
      'info.faq': 'Chinese FAQ Guide',
      'info.classGuides': 'Class Guides (Chinese)',
      'info.warrior': 'Warrior',
      'info.magician': 'Magician',
      'info.bowman': 'Bowman',
      'info.thief': 'Thief',
      'info.pirate': 'Pirate',
      'info.updates': 'UPDATE — Chinese Translation',
      'info.lastUnwelcomeGuest': 'Last Unwelcome Guest',
      'info.zenomega': 'Zenomega Boss',
      'info.pianus': 'Pianus Boss',
      'info.personal': 'This site is for personal use and backup purposes. Data may not be up-to-date or fully accurate. Please refer to in-game info and official sources.',
      'info.lastUpdatedLabel': 'Last updated: ',
      'info.feedbackLabel': 'Bug Report / Suggestion Form: ',
      'nav.about': 'About',

      'section.monsters': 'Monsters',
      'section.items': 'Items',

      'loading': 'Loading...',
      'loading.monsters': 'Loading monsters...',
      'loading.items': 'Loading items...',
      'loading.drops': 'Loading drops...',
      'loading.gacha': 'Loading gacha...',
      'loading.maps': 'Loading maps...',
      'loading.indexing': 'Building indexes...',
      'loading.done': 'Done!',

      'search.placeholder': 'Search monsters or items...',
      'search.noResults': 'No results found',

      'filter.levelRange': 'Level',
      'filter.type': 'Type',
      'filter.boss': 'Boss',
      'filter.normal': 'Normal',
      'filter.all': 'All',

      'filter.category': 'Category',
      'filter.equip': 'Equip',
      'filter.consume': 'Consumable',
      'filter.scroll': 'Scroll',
      'filter.material': 'Material',
      'filter.cash': 'Cash',
      'filter.job': 'Job',
      'filter.warrior': 'Warrior',
      'filter.magician': 'Magician',
      'filter.bowman': 'Bowman',
      'filter.thief': 'Thief',
      'filter.pirate': 'Pirate',
      'filter.beginner': 'Beginner',
      'filter.region': 'Region',
      'filter.element': 'Element',
      'filter.levelMin': 'Min',
      'filter.levelMax': 'Max',
      'filter.quest': 'Quest Item',
      'filter.armor': 'Armor',
      'filter.weapon': 'Weapon',
      'filter.accessory': 'Accessory',
      'filter.scrollRate': 'Success Rate',
      'filter.scrollTarget': 'Target',
      'filter.scrollStat': 'Stat',
      'filter.toggle': 'Filter',
      'filter.immunity': 'Immunity',
      'filter.weakness': 'Weakness',
      'filter.resistance': 'Resistance',
      'empty.monsterPrompt': 'Select a filter or search for monsters',
      'empty.itemPrompt': 'Select a filter or search for items',

      // Armor
      'subCat.hat': 'Hat',
      'subCat.top': 'Top',
      'subCat.bottom': 'Bottom',
      'subCat.overall': 'Overall',
      'subCat.shoes': 'Shoes',
      'subCat.gloves': 'Gloves',
      'subCat.shield': 'Shield',
      'subCat.cape': 'Cape',
      // Accessory
      'subCat.earrings': 'Earrings',
      'subCat.ring': 'Ring',
      'subCat.belt': 'Belt',
      'subCat.faceAccessory': 'Face Acc.',
      'subCat.eyeAccessory': 'Eye Acc.',
      'subCat.pendant': 'Pendant',
      'subCat.accessory': 'Accessory',
      // Weapon
      'subCat.weapon': 'Weapon',
      'subCat.oneHandedSword': '1H Sword',
      'subCat.oneHandedAxe': '1H Axe',
      'subCat.oneHandedBlunt': '1H Blunt',
      'subCat.dagger': 'Dagger',
      'subCat.wand': 'Wand',
      'subCat.staff': 'Staff',
      'subCat.twoHandedSword': '2H Sword',
      'subCat.twoHandedAxe': '2H Axe',
      'subCat.twoHandedBlunt': '2H Blunt',
      'subCat.spear': 'Spear',
      'subCat.polearm': 'Polearm',
      'subCat.bow': 'Bow',
      'subCat.crossbow': 'Crossbow',
      'subCat.claw': 'Claw',
      'subCat.knuckle': 'Knuckle',
      'subCat.gun': 'Gun',
      'subCat.projectile': 'Projectile',
      // Other
      'subCat.potion': 'Potion',
      'subCat.consumable': 'Consumable',
      'subCat.scroll': 'Scroll',
      'subCat.monsterDrop': 'Monster Drop',
      'subCat.quest': 'Quest Item',
      'subCat.questItem': 'Quest Item',
      'subCat.ore': 'Ore',
      'subCat.mineralOre': 'Mineral Ore',
      'subCat.rareOre': 'Rare Ore',
      'subCat.book': 'Skill Book',
      'subCat.cosmetic': 'Cosmetic',

      'detail.back': '← Back to list',
      'detail.level': 'Level',
      'detail.hp': 'HP',
      'detail.exp': 'EXP',
      'detail.acc': 'Accuracy',
      'detail.avoid': 'Avoidability',
      'detail.maps': 'Spawn Maps',
      'detail.drops': 'Drop Table',
      'detail.meso': 'Meso',
      'detail.dropRate': 'Drop Rate',
      'detail.quantity': 'Quantity',
      'detail.requirements': 'Requirements',
      'detail.stats': 'Stats',
      'detail.scrollEffect': 'Scroll Effect',
      'detail.target': 'Target',
      'detail.successRate': 'Success Rate',
      'detail.exchangeRate': 'Decompose Qty',
      'detail.voucherCost': 'Voucher Cost',
      'detail.notDecomposable': 'N/A',
      'detail.notAvailable': 'Not Available',
      'detail.effect': 'Effect',
      'detail.tuc': 'Upgrade Slots',
      'detail.droppedBy': 'Dropped By',
      'detail.gachaSource': 'Gacha Source',
      'detail.noDropSource': 'No known sources',
      'detail.noData': 'Data pending',

      // Calculator
      'calc.toggle': 'Hit/Dodge Calc',
      'calc.playerLevel': 'Char Level',
      'calc.playerHit': 'Hit',
      'calc.playerAvoid': 'Avoid',
      'calc.physical': 'Physical',
      'calc.mage': 'Mage',
      'calc.thief': 'Thief',
      'calc.hitRate': 'Hit Rate',
      'calc.dodgeRate': 'Dodge Rate',
      'calc.required100': '100% Hit',

      'detail.dropGroup.meso': 'Meso',
      'detail.dropGroup.scroll': 'Scrolls',
      'detail.dropGroup.equip': 'Equipment',
      'detail.dropGroup.consume': 'Consumables',
      'detail.dropGroup.other': 'Others',
      'detail.weakness': 'Weakness',
      'detail.resistance': 'Resistance',
      'detail.immunity': 'Immunity',

      'stat.attack': 'ATK',
      'stat.magicAttack': 'M.ATK',
      'stat.weaponDef': 'W.DEF',
      'stat.magicDef': 'M.DEF',
      'stat.hp': 'HP',
      'stat.mp': 'MP',
      'stat.str': 'STR',
      'stat.dex': 'DEX',
      'stat.int': 'INT',
      'stat.luk': 'LUK',
      'stat.acc': 'ACC',
      'stat.avoid': 'AVOID',
      'stat.speed': 'Speed',
      'stat.jump': 'Jump',
      'stat.attackSpeed': 'ATK Speed',
      'stat.hpPercent': 'HP%',
      'stat.mpPercent': 'MP%',

      'gacha.title': 'Gachapon',
      'gacha.items': 'items',
      'gacha.rate': 'Rate',
      'gacha.searchPlaceholder': 'Search in gachapon...',

      // Favorites
      'favorites.title': 'My Favorites',
      'favorites.empty': 'No favorites yet',
      'favorites.add': 'Add to favorites',
      'favorites.remove': 'Remove from favorites',

      'job.warrior': 'Warrior',
      'job.magician': 'Magician',
      'job.bowman': 'Bowman',
      'job.thief': 'Thief',
      'job.pirate': 'Pirate',
      'job.beginner': 'Beginner',

      'count.showing': 'Showing {shown} / {total}',
      'count.filtered': '{count} results',
    }
  };

  function t(key, params) {
    const str = translations[currentLang]?.[key] || translations.zh[key] || key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
  }

  function name(obj) {
    if (!obj?.name) return '';
    return obj.name[currentLang] || obj.name.zh || obj.name.en || '';
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('chronostory-lang', lang);
    updateDOM();
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
  }

  function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
  }

  return { t, name, getLang, setLang, updateDOM };
})();
