/* === Search: 搜尋功能 === */

const Search = (() => {
  let monsterQuery = '';
  let itemQuery = '';

  function init() {
    const input = document.getElementById('global-search');
    if (!input) return;

    input.addEventListener('input', Utils.debounce(() => {
      const q = input.value.trim();
      monsterQuery = q;
      itemQuery = q;
      if (q) {
        Filters.resetMonsterState();
        Filters.resetItemState();
        App.showPanel('items'); // #3: Show item panel when searching

        // 若在詳細頁面，搜尋時自動退出回到列表
        const monsterBody = document.getElementById('monster-body');
        const itemBody = document.getElementById('item-body');
        if (monsterBody.dataset.mode === 'detail') monsterBody.dataset.mode = 'list';
        if (itemBody.dataset.mode === 'detail') itemBody.dataset.mode = 'list';
        Router.clearState({ monsterId: null, itemId: null });
      }
      RenderList.renderMonsters();
      RenderList.renderItems();
    }, 200));

    // Clear search on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        monsterQuery = '';
        itemQuery = '';
        RenderList.renderMonsters();
        RenderList.renderItems();
      }
    });
  }

  function getMonsterQuery() { return monsterQuery; }
  function getItemQuery() { return itemQuery; }

  function clear() {
    monsterQuery = '';
    itemQuery = '';
    const input = document.getElementById('global-search');
    if (input) input.value = '';
  }

  return { init, getMonsterQuery, getItemQuery, clear };
})();
