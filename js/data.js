/* === Data: 載入 JSON + 建立索引 === */

const Data = (() => {
  // Raw data stores
  let monsters = {};
  let items = {};
  let drops = [];
  let gachas = {};
  let maps = {};

  // Derived indexes
  let monsterList = [];  // sorted by level desc
  let itemList = [];     // sorted by id
  let dropsByMonster = {};  // monsterId -> [dropRecord]
  let dropsByItem = {};     // itemId -> [dropRecord]
  let gachaByItem = {};     // itemId -> [{gachaId, gachaName, rate}]
  let monstersByRegion = {};  // regionName -> Set<monsterId>
  let monstersByBuffType = {}; // buffType -> Set<monsterId>
  let allRegions = [];    // sorted unique region names
  let allBuffTypes = [];  // sorted unique buffType names

  async function loadAll(onProgress) {
    const files = [
      { key: 'monsters', path: 'data/monsters.json', i18nKey: 'loading.monsters' },
      { key: 'items', path: 'data/items.json', i18nKey: 'loading.items' },
      { key: 'drops', path: 'data/drops.json', i18nKey: 'loading.drops' },
      { key: 'gacha', path: 'data/gacha.json', i18nKey: 'loading.gacha' },
      { key: 'maps', path: 'data/maps.json', i18nKey: 'loading.maps' },
    ];

    const results = {};
    let loaded = 0;

    await Promise.all(files.map(async (f) => {
      onProgress?.(I18n.t(f.i18nKey), (loaded / files.length) * 100);
      const res = await fetch(f.path);
      results[f.key] = await res.json();
      loaded++;
      onProgress?.(I18n.t(f.i18nKey), (loaded / files.length) * 100);
    }));

    monsters = results.monsters;
    items = results.items;
    drops = results.drops;
    gachas = results.gacha;
    maps = results.maps;

    onProgress?.(I18n.t('loading.indexing'), 90);
    buildIndexes();
    onProgress?.(I18n.t('loading.done'), 100);
  }

  function buildIndexes() {
    // Monster list sorted by level descending
    monsterList = Object.values(monsters).sort((a, b) => b.level - a.level || a.id - b.id);

    // Item list sorted by id
    itemList = Object.values(items).sort((a, b) => a.id - b.id);

    // Drops indexed by monster and by item
    dropsByMonster = {};
    dropsByItem = {};
    for (const drop of drops) {
      const mid = drop.monsterId;
      const iid = drop.itemId;
      if (!dropsByMonster[mid]) dropsByMonster[mid] = [];
      dropsByMonster[mid].push(drop);
      if (!dropsByItem[iid]) dropsByItem[iid] = [];
      dropsByItem[iid].push(drop);
    }

    // Sort drops by rate descending
    for (const arr of Object.values(dropsByMonster)) {
      arr.sort((a, b) => b.rate - a.rate);
    }
    for (const arr of Object.values(dropsByItem)) {
      arr.sort((a, b) => b.rate - a.rate);
    }

    // Monsters by region (from mapIds → maps.region)
    monstersByRegion = {};
    const regionSet = new Set();
    for (const monster of monsterList) {
      if (!monster.mapIds) continue;
      for (const mapId of monster.mapIds) {
        const map = maps[mapId];
        if (map?.region) {
          regionSet.add(map.region);
          if (!monstersByRegion[map.region]) monstersByRegion[map.region] = new Set();
          monstersByRegion[map.region].add(monster.id);
        }
      }
    }
    allRegions = [...regionSet].sort();

    // Monsters by buffType
    monstersByBuffType = {};
    const buffSet = new Set();
    for (const monster of monsterList) {
      if (!monster.buffType) continue;
      for (const bt of monster.buffType) {
        buffSet.add(bt);
        if (!monstersByBuffType[bt]) monstersByBuffType[bt] = new Set();
        monstersByBuffType[bt].add(monster.id);
      }
    }
    allBuffTypes = [...buffSet].sort();

    // Gacha indexed by item
    gachaByItem = {};
    for (const [gachaId, gacha] of Object.entries(gachas)) {
      for (const entry of gacha.items) {
        const iid = entry.itemId;
        if (!gachaByItem[iid]) gachaByItem[iid] = [];
        gachaByItem[iid].push({
          gachaId: Number(gachaId),
          gachaName: gacha.name,
          rate: entry.rate
        });
      }
    }
  }

  return {
    loadAll,
    getMonsters: () => monsters,
    getItems: () => items,
    getMaps: () => maps,
    getGachas: () => gachas,
    getMonsterList: () => monsterList,
    getItemList: () => itemList,
    getDropsByMonster: (id) => dropsByMonster[id] || [],
    getDropsByItem: (id) => dropsByItem[id] || [],
    getGachaByItem: (id) => gachaByItem[id] || [],
    getMonster: (id) => monsters[id],
    getItem: (id) => items[id],
    getMap: (id) => maps[id],
    getGacha: (id) => gachas[id],
    getMonstersByRegion: (region) => monstersByRegion[region] || new Set(),
    getMonstersByBuffType: (bt) => monstersByBuffType[bt] || new Set(),
    getAllRegions: () => allRegions,
    getAllBuffTypes: () => allBuffTypes,
  };
})();
