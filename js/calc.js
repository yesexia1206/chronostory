/* === HitCalc: 命中/迴避計算器 === */

const HitCalc = (() => {

  const STORAGE_KEY = 'chronostory-calc';
  let playerStats = { level: 1, hit: 0, avoid: 0, classType: 'physical' };

  // --- Persistence ---

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        playerStats = { ...playerStats, ...saved };
      }
    } catch (_) { /* ignore */ }
  }

  const save = Utils.debounce(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
    } catch (_) { /* ignore */ }
  }, 200);

  // --- Formulas ---

  function calcPhysicalHit(pLevel, pHit, mLevel, mAvoid) {
    if (mAvoid === 0) return { hitRate: 100, requiredHit: 0 };
    const levelDiff = Math.max(0, mLevel - pLevel);
    const requiredHit = (55.2 + 2.15 * levelDiff) * (mAvoid / 15.0);
    const halfReq = requiredHit * 0.5;
    if (halfReq === 0) return { hitRate: 100, requiredHit: 0 };
    let hitRate = 100 * ((pHit - halfReq) / halfReq);
    hitRate = Math.max(0, Math.min(100, hitRate));
    return { hitRate, requiredHit: Math.ceil(requiredHit) };
  }

  function calcMageHit(pLevel, pHit, mLevel, mAvoid) {
    if (mAvoid === 0) return { hitRate: 100, requiredHit: 1 };
    let requiredHit;
    if (pLevel >= mLevel) {
      requiredHit = mAvoid + 1;
    } else {
      requiredHit = (mAvoid + 1) * (1 + 0.0415 * (mLevel - pLevel));
    }
    if (pHit >= requiredHit) return { hitRate: 100, requiredHit: Math.ceil(requiredHit) };
    const ratio = pHit / requiredHit;
    let hitRate = (-2.5795 * ratio * ratio + 5.2343 * ratio - 1.6749) * 100;
    hitRate = Math.max(0, Math.min(100, hitRate));
    return { hitRate, requiredHit: Math.ceil(requiredHit) };
  }

  function calcHitRate(pLevel, pHit, mLevel, mAvoid, classType) {
    if (classType === 'mage') return calcMageHit(pLevel, pHit, mLevel, mAvoid);
    return calcPhysicalHit(pLevel, pHit, mLevel, mAvoid);
  }

  function calcDodgeRate(pLevel, pAvoid, mLevel, mAcc, classType) {
    if (mAcc === 0) {
      return { dodgeRate: classType === 'thief' ? 95 : 80 };
    }
    let adjustedAvoid = Math.min(pAvoid, 999);
    if (pLevel < mLevel) {
      adjustedAvoid -= Math.floor((mLevel - pLevel) / 2); // SAR(diff, 1)
      adjustedAvoid = Math.max(0, adjustedAvoid);
    }
    let dodgeRate = (adjustedAvoid / (mAcc * 4.5)) * 100;
    if (classType === 'thief') {
      dodgeRate = Math.max(5, Math.min(95, dodgeRate));
    } else {
      dodgeRate = Math.max(2, Math.min(80, dodgeRate));
    }
    return { dodgeRate };
  }

  // --- UI ---

  function attachTo(statGrid, monster) {
    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'calc-toggle-btn';
    toggleBtn.textContent = I18n.t('calc.toggle');

    // Panel
    const panel = buildCalcPanel(statGrid, monster);

    toggleBtn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
    });

    statGrid.appendChild(toggleBtn);
    statGrid.appendChild(panel);

    // Auto-show results if user has saved stats with meaningful data
    if (playerStats.level > 0 && (playerStats.hit > 0 || playerStats.avoid > 0)) {
      updateResults(statGrid, monster);
    }
  }

  function buildCalcPanel(statGrid, monster) {
    const panel = document.createElement('div');
    panel.className = 'calc-panel';

    // --- Inputs row ---
    const inputs = document.createElement('div');
    inputs.className = 'calc-inputs';

    const fields = [
      { key: 'level', label: I18n.t('calc.playerLevel'), val: playerStats.level },
      { key: 'hit',   label: I18n.t('calc.playerHit'),   val: playerStats.hit },
      { key: 'avoid', label: I18n.t('calc.playerAvoid'), val: playerStats.avoid },
    ];

    for (const f of fields) {
      const group = document.createElement('div');
      group.className = 'calc-input-group';

      const lbl = document.createElement('label');
      lbl.textContent = f.label;

      const inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'filter-range-input';
      inp.min = 0;
      inp.value = f.val || '';
      inp.placeholder = '0';

      inp.addEventListener('input', () => {
        const v = inp.value !== '' ? parseInt(inp.value, 10) : 0;
        playerStats[f.key] = isNaN(v) ? 0 : v;
        save();
        updateResults(statGrid, monster);
      });

      group.appendChild(lbl);
      group.appendChild(inp);
      inputs.appendChild(group);
    }

    panel.appendChild(inputs);

    // --- Class type row ---
    const classRow = document.createElement('div');
    classRow.className = 'calc-class-row';

    const classTypes = [
      { key: 'physical', label: I18n.t('calc.physical') },
      { key: 'mage',     label: I18n.t('calc.mage') },
      { key: 'thief',    label: I18n.t('calc.thief') },
    ];

    for (const ct of classTypes) {
      const btn = document.createElement('button');
      btn.className = 'filter-tag' + (playerStats.classType === ct.key ? ' active' : '');
      btn.textContent = ct.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playerStats.classType = ct.key;
        save();
        // Update active state
        classRow.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateResults(statGrid, monster);
      });
      classRow.appendChild(btn);
    }

    panel.appendChild(classRow);

    return panel;
  }

  function clearResults(statGrid) {
    statGrid.querySelectorAll('.calc-stat-item').forEach(el => el.remove());
  }

  function makeStatItem(label, value, color) {
    const item = document.createElement('div');
    item.className = 'stat-item calc-stat-item';
    item.innerHTML = `
      <div class="stat-label">${label}</div>
      <div class="stat-value" style="color:${color}">${value}</div>
    `;
    return item;
  }

  function updateResults(statGrid, monster) {
    clearResults(statGrid);

    const pLevel = playerStats.level || 0;
    const pHit = playerStats.hit || 0;
    const pAvoid = playerStats.avoid || 0;
    const classType = playerStats.classType;
    const panel = statGrid.querySelector('.calc-panel');

    // --- Hit rate → new stat-items after panel ---
    if (pHit > 0) {
      const { hitRate, requiredHit } = calcHitRate(pLevel, pHit, monster.level, monster.avoid, classType);
      panel.after(
        makeStatItem(I18n.t('calc.required100'), requiredHit, 'var(--text-secondary)')
      );
      panel.after(
        makeStatItem(I18n.t('calc.hitRate'), hitRate.toFixed(1) + '%', 'var(--stat-acc)')
      );
    }

    // --- Dodge rate → new stat-item after panel ---
    if (pAvoid > 0) {
      const { dodgeRate } = calcDodgeRate(pLevel, pAvoid, monster.level, monster.acc, classType);
      const lastItem = statGrid.querySelector('.calc-stat-item:last-of-type') || panel;
      lastItem.after(
        makeStatItem(I18n.t('calc.dodgeRate'), dodgeRate.toFixed(1) + '%', 'var(--stat-avoid)')
      );
    }
  }

  // --- Init ---
  load();

  return { attachTo };
})();
