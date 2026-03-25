const STORAGE_KEY = 'powder-calculator-settings-v1';

const defaultMaterials = [
  { thickness: 0.45, width: 1250, mass: 4.34, defaultPrice: null },
  { thickness: 0.5, width: 1250, mass: 4.88, defaultPrice: 115000 },
  { thickness: 0.65, width: 1250, mass: 6.273, defaultPrice: null },
  { thickness: 0.7, width: 1250, mass: 6.754, defaultPrice: 105000 },
  { thickness: 0.8, width: 1250, mass: 7.7, defaultPrice: null },
  { thickness: 0.9, width: 1250, mass: 8.658, defaultPrice: null },
  { thickness: 0.95, width: 1250, mass: 9.13, defaultPrice: null },
  { thickness: 1.0, width: 1250, mass: 9.382, defaultPrice: 109000 },
  { thickness: 1.2, width: 1250, mass: 11.538, defaultPrice: 115400 },
  { thickness: 1.5, width: 1250, mass: 14.815, defaultPrice: 117000 },
  { thickness: 2.0, width: 1250, mass: 19.532, defaultPrice: 117000 },
  { thickness: 2.5, width: 1000, mass: 19.62, defaultPrice: 117000 },
  { thickness: 3.0, width: 1000, mass: 23.5, defaultPrice: 120000 },
];

const state = {
  materials: defaultMaterials.map((item) => ({ ...item })),
  isEditing: false,
  isCollapsed: false,
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  attachEventListeners();
  loadSettings();
  renderMaterialInputs();
  updatePriceDisplays();
  syncEditMode();
});

function cacheDom() {
  dom.materialPrices = document.getElementById('materialPrices');
  dom.materialPricesBody = document.getElementById('materialPricesBody');
  dom.materialsCard = document.getElementById('materialsCard');
  dom.editPricesBtn = document.getElementById('editPricesBtn');
  dom.editPricesText = document.getElementById('editPricesText');
  dom.savePricesBtn = document.getElementById('savePricesBtn');
  dom.resetPricesBtn = document.getElementById('resetPricesBtn');
  dom.pricesActions = document.getElementById('pricesActions');
  dom.calculateBtn = document.getElementById('calculateBtn');
  dom.resultsContainer = document.getElementById('resultsContainer');
  dom.paintingPrice = document.getElementById('paintingPrice');
  dom.processingRate = document.getElementById('processingRate');
  dom.collapseBtn = document.getElementById('collapseBtn');
}

function attachEventListeners() {
  dom.editPricesBtn.addEventListener('click', () => {
    state.isEditing = !state.isEditing;
    syncEditMode();
  });

  dom.savePricesBtn.addEventListener('click', () => {
    if (!validateMaterialInputs()) return;
    readMaterialInputs();
    state.isEditing = false;
    syncEditMode();
    updatePriceDisplays();
    saveSettings();
  });

  dom.resetPricesBtn.addEventListener('click', () => {
    state.materials = defaultMaterials.map((item) => ({ ...item }));
    renderMaterialInputs();
    updatePriceDisplays();
  });

  dom.calculateBtn.addEventListener('click', calculateResults);

  dom.collapseBtn.addEventListener('click', () => {
    state.isCollapsed = !state.isCollapsed;
    syncCollapseState();
    saveSettings();
  });
}

function renderMaterialInputs() {
  dom.materialPrices.innerHTML = '';

  state.materials.forEach((mat, index) => {
    const item = document.createElement('div');
    item.className = 'material-item';

    const info = document.createElement('div');

    const title = document.createElement('p');
    title.className = 'material-title';
    title.textContent = `${mat.thickness.toFixed(2)} мм`;

    const meta = document.createElement('p');
    meta.className = 'material-meta';
    meta.textContent = `Ширина: ${mat.width} мм | Масса: ${mat.mass.toFixed(3)} кг/м`;

    info.appendChild(title);
    info.appendChild(meta);

    const priceWrap = document.createElement('div');
    priceWrap.className = 'material-price';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.className = 'input material-input';
    input.dataset.index = String(index);
    input.value = mat.defaultPrice != null ? mat.defaultPrice.toFixed(2) : '';

    const display = document.createElement('span');
    display.className = 'material-price-display';
    display.dataset.displayIndex = String(index);

    priceWrap.appendChild(input);
    priceWrap.appendChild(display);

    item.appendChild(info);
    item.appendChild(priceWrap);
    dom.materialPrices.appendChild(item);
  });

  syncEditMode();
}

function readMaterialInputs() {
  const inputs = dom.materialPrices.querySelectorAll('.material-input');
  inputs.forEach((input) => {
    const index = Number(input.dataset.index);
    const value = input.value.trim();
    state.materials[index].defaultPrice = value === '' ? null : Number(value);
  });
}

function updatePriceDisplays() {
  const inputs = dom.materialPrices.querySelectorAll('.material-input');
  inputs.forEach((input) => {
    const index = input.dataset.index;
    const display = dom.materialPrices.querySelector(`.material-price-display[data-display-index="${index}"]`);
    if (!display) return;

    const value = input.value.trim();
    if (value === '') {
      display.textContent = '—';
      display.style.color = 'var(--text-muted)';
    } else {
      display.textContent = `${Math.round(Number(value)).toLocaleString('ru-RU')} руб/т`;
      display.style.color = '#1e3a8a';
    }
  });
}

function validateMaterialInputs() {
  let isValid = true;
  const inputs = dom.materialPrices.querySelectorAll('.material-input');

  inputs.forEach((input) => {
    const value = input.value.trim();
    const badValue = value !== '' && Number(value) < 0;
    input.classList.toggle('invalid', badValue);
    if (badValue) isValid = false;
  });

  if (!isValid) {
    alert('Пожалуйста, проверьте цены сырья. Значения должны быть неотрицательными.');
  }
  return isValid;
}

function syncEditMode() {
  const inputs = dom.materialPrices.querySelectorAll('.material-input');
  const displays = dom.materialPrices.querySelectorAll('.material-price-display');

  inputs.forEach((input) => {
    input.classList.toggle('hidden', !state.isEditing);
  });
  displays.forEach((span) => {
    span.classList.toggle('hidden', state.isEditing);
  });

  dom.pricesActions.classList.toggle('hidden', !state.isEditing);
  dom.editPricesText.textContent = state.isEditing ? 'Отмена' : 'Редактировать цены';
}

function syncCollapseState() {
  dom.materialsCard.classList.toggle('collapsed', state.isCollapsed);
  dom.collapseBtn.textContent = state.isCollapsed ? 'Развернуть' : 'Свернуть';
}

function calculateResults() {
  if (!validateMaterialInputs()) return;
  readMaterialInputs();
  updatePriceDisplays();

  const paintingPrice = Number(dom.paintingPrice.value);
  const processingRate = Number(dom.processingRate.value);

  if (!Number.isFinite(paintingPrice) || !Number.isFinite(processingRate)) {
    alert('Пожалуйста, введите корректные параметры расчета.');
    return;
  }

  const rows = state.materials
    .filter((mat) => mat.defaultPrice != null && Number.isFinite(mat.defaultPrice))
    .map((mat) => {
      const widthMeters = mat.width / 1000;
      const metersPerTonne = 1000 / mat.mass;
      const squareMetersPerTonne = metersPerTonne * widthMeters;
      const coverageCostPerTonne = squareMetersPerTonne * paintingPrice;
      const preliminary = Number(mat.defaultPrice) + coverageCostPerTonne;
      const finalPrice = preliminary + processingRate;

      return {
        thickness: mat.thickness,
        width: mat.width,
        mass: mat.mass,
        materialPrice: Number(mat.defaultPrice),
        coverageCost: coverageCostPerTonne,
        preliminary,
        finalPrice,
      };
    });

  renderResultsTable(rows);
  saveSettings();
}

function renderResultsTable(rows) {
  dom.resultsContainer.innerHTML = '';

  if (!rows.length) {
    const p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = 'Не указаны цены сырья. Заполните хотя бы одно поле и повторите расчет.';
    dom.resultsContainer.appendChild(p);
    return;
  }

  const table = document.createElement('table');
  table.className = 'results-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  [
    'Толщина (мм)',
    'Ширина (мм)',
    'Масса (кг/м)',
    'Цена сырья (руб/т)',
    'Стоимость покрытия (руб/т)',
    'Без переработки (руб/т)',
    'Итоговая цена (руб/т)',
  ].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    appendCell(tr, row.thickness.toFixed(2));
    appendCell(tr, String(row.width));
    appendCell(tr, row.mass.toFixed(3));
    appendCell(tr, Math.round(row.materialPrice).toLocaleString('ru-RU'));
    appendCell(tr, Math.round(row.coverageCost).toLocaleString('ru-RU'));
    appendCell(tr, Math.round(row.preliminary).toLocaleString('ru-RU'));
    appendCell(tr, Math.round(row.finalPrice).toLocaleString('ru-RU'));
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  dom.resultsContainer.appendChild(table);
}

function appendCell(row, value) {
  const td = document.createElement('td');
  td.textContent = value;
  row.appendChild(td);
}

function saveSettings() {
  const materialPriceMap = {};
  state.materials.forEach((mat) => {
    materialPriceMap[String(mat.thickness)] = mat.defaultPrice == null ? '' : String(mat.defaultPrice);
  });

  const payload = {
    paintingPrice: dom.paintingPrice.value,
    processingRate: dom.processingRate.value,
    isCollapsed: state.isCollapsed,
    materialPrices: materialPriceMap,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    syncCollapseState();
    return;
  }

  try {
    const settings = JSON.parse(raw);

    if (settings.paintingPrice != null) {
      dom.paintingPrice.value = settings.paintingPrice;
    }
    if (settings.processingRate != null) {
      dom.processingRate.value = settings.processingRate;
    }
    if (settings.materialPrices && typeof settings.materialPrices === 'object' && !Array.isArray(settings.materialPrices)) {
      state.materials.forEach((mat) => {
        const raw = settings.materialPrices[String(mat.thickness)];
        if (raw !== undefined) {
          mat.defaultPrice = raw === '' ? null : Number(raw);
        }
      });
    } else if (Array.isArray(settings.materialPrices)) {
      settings.materialPrices.forEach((value, index) => {
        if (index < state.materials.length) {
          state.materials[index].defaultPrice = value === '' ? null : Number(value);
        }
      });
    }
    state.isCollapsed = Boolean(settings.isCollapsed);
  } catch {
    // ignore broken localStorage payload
  }

  syncCollapseState();
}
