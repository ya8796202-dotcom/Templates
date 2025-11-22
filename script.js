// script.js

// قاعدة بيانات بسيطة (IndexedDB مع fallback لـ LocalStorage)
const DB_NAME = 'template-manager';
const STORE = 'templates';
let db;
const useLS = !('indexedDB' in window);

async function initDB() {
  if (useLS) return;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

function id() { return 'tpl_' + Math.random().toString(36).slice(2, 9); }

const Storage = {
  async all() {
    if (useLS) {
      const raw = localStorage.getItem(STORE);
      return raw ? JSON.parse(raw) : [];
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      tx.onsuccess = () => resolve(tx.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  async put(obj) {
    if (useLS) {
      const items = await Storage.all();
      const idx = items.findIndex(x => x.id === obj.id);
      if (idx >= 0) items[idx] = obj; else items.push(obj);
      localStorage.setItem(STORE, JSON.stringify(items));
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).put(obj);
      tx.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async delete(idVal) {
    if (useLS) {
      const items = await Storage.all();
      localStorage.setItem(STORE, JSON.stringify(items.filter(x => x.id !== idVal)));
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(idVal);
      tx.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};

// عناصر الواجهة
const templateList = document.getElementById('templateList');
const htmlCode = document.getElementById('htmlCode');
const cssCode = document.getElementById('cssCode');
const jsCode = document.getElementById('jsCode');
const tplName = document.getElementById('tplName');
const tplTags = document.getElementById('tplTags');
const previewFrame = document.getElementById('previewFrame');
const effectsList = document.getElementById('effectsList');

let currentTemplate = null;
let effectsCatalog = [
  { id:'fx-bounce', name:'Bounce', group:'animations' },
  { id:'fx-fade-in', name:'Fade In', group:'animations' },
  { id:'fx-pulse', name:'Pulse', group:'animations' },
  { id:'fx-glow', name:'Glow', group:'shadows' },
  { id:'fx-soft-shadow', name:'Soft Shadow', group:'shadows' },
  { id:'fx-elevate', name:'Elevated', group:'shadows' },
  { id:'fx-gradient-aurora', name:'Aurora Gradient', group:'gradients' },
  { id:'fx-gradient-midnight', name:'Midnight Gradient', group:'gradients' },
  { id:'fx-border-neon', name:'Neon Border', group:'shadows' },
  { id:'fx-border-gradient', name:'Gradient Border', group:'gradients' },
];

// Tabs switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    [htmlCode, cssCode, jsCode, document.getElementById('metaPanel')]
      .forEach(el => el.classList.add('hidden'));
    if (target === 'html') htmlCode.classList.remove('hidden');
    if (target === 'css') cssCode.classList.remove('hidden');
    if (target === 'js') jsCode.classList.remove('hidden');
    if (target === 'meta') document.getElementById('metaPanel').classList.remove('hidden');
  });
});

// Render effects
function renderEffects(group='all') {
  effectsList.innerHTML = '';
  effectsCatalog
    .filter(e => group === 'all' ? true : e.group === group)
    .forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${e.name} <code>${e.id}</code></span>
        <button class="btn" data-apply="${e.id}">تطبيق</button>
      `;
      effectsList.appendChild(li);
    });
}
renderEffects();

// فلترة المؤثرات
document.querySelectorAll('.effects-filter .chip').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('.effects-filter .chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    renderEffects(ch.dataset.group);
  });
});

// تحديث القائمة
async function refreshList() {
  const items = await Storage.all();
  templateList.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small style="display:block;color:#98a8c7">${(item.tags||[]).join(', ')}</small>
      </div>
      <div>
        <button class="btn" data-open="${item.id}">فتح</button>
      </div>
    `;
    templateList.appendChild(li);
  });
}

// إنشاء قالب جديد
document.getElementById('newTemplate').addEventListener('click', () => {
  currentTemplate = {
    id: id(),
    name: 'قالب جديد',
    tags: [],
    html: '<div class="card fx-bounce">Hello Template</div>',
    css: '.card{padding:16px;border-radius:12px;background:#0d1117;color:#e7efff}',
    js: 'console.log("Template ready")',
    effects: []
  };
  bindEditor(currentTemplate);
  updatePreview();
});

function bindEditor(tpl) {
  tplName.value = tpl.name || '';
  tplTags.value = (tpl.tags || []).join(', ');
  htmlCode.value = tpl.html || '';
  cssCode.value = tpl.css || '';
  jsCode.value = tpl.js || '';
}

// فتح قالب
templateList.addEventListener('click', async (e) => {
  const idOpen = e.target.dataset.open;
  if (!idOpen) return;
  const items = await Storage.all();
  const found = items.find(x => x.id === idOpen);
  if (!found) return;
  currentTemplate = found;
  bindEditor(currentTemplate);
  updatePreview();
});

// حفظ/حذف/نسخ
document.getElementById('saveTemplate').addEventListener('click', async () => {
  if (!currentTemplate) currentTemplate = { id: id() };
  currentTemplate.name = tplName.value.trim() || 'بدون عنوان';
  currentTemplate.tags = tplTags.value.split(',').map(s => s.trim()).filter(Boolean);
  currentTemplate.html = htmlCode.value;
  currentTemplate.css = cssCode.value;
  currentTemplate.js = jsCode.value;
  await Storage.put(currentTemplate);
  await refreshList();
});

document.getElementById('deleteTemplate').addEventListener('click', async () => {
  if (!currentTemplate) return;
  await Storage.delete(currentTemplate.id);
  currentTemplate = null;
  htmlCode.value = cssCode.value = jsCode.value = tplName.value = tplTags.value = '';
  await refreshList();
  updatePreview();
});

document.getElementById('duplicateTemplate').addEventListener('click', async () => {
  if (!currentTemplate) return;
  const copy = { ...currentTemplate, id: id(), name: currentTemplate.name + ' (نسخة)' };
  await Storage.put(copy);
  await refreshList();
});

// تطبيق المؤثرات
document.getElementById('applyEffects').addEventListener('click', () => {
  if (!currentTemplate) return;
  const code = htmlCode.value;
  const combined = currentTemplate.effects?.join(' ') || '';
  const patched = code.replace(/(<\w+)([^>]*>)/, `$1 class="${combined}"$2`);
  htmlCode.value = patched;
  updatePreview();
});

effectsList.addEventListener('click', (e) => {
  const fx = e.target.dataset.apply;
  if (!fx) return;
  if (!currentTemplate) return;
  currentTemplate.effects = Array.from(new Set([...(currentTemplate.effects || []), fx]));
  e.target.textContent = 'مُضاف ✓';
  set
