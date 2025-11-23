// PWA install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

// Mode toggle
const modeToggle = document.getElementById('modeToggle');
const savedMode = localStorage.getItem('laloly:mode') || 'dark';
document.documentElement.className = savedMode;
modeToggle.textContent = savedMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن';
modeToggle.addEventListener('click', () => {
  const next = document.documentElement.className === 'dark' ? 'light' : 'dark';
  document.documentElement.className = next;
  modeToggle.textContent = next === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن';
  localStorage.setItem('laloly:mode', next);
});

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content > *').forEach(el => el.classList.add('hidden'));
    document.getElementById(btn.dataset.target).classList.remove('hidden');
  });
});

// Editor elements
const htmlEl = document.getElementById('htmlTab');
const cssEl = document.getElementById('cssTab');
const jsEl = document.getElementById('jsTab');
const preview = document.getElementById('preview');

const projectNameEl = document.getElementById('projectName');
const uiFontEl = document.getElementById('uiFont');
const primaryColorEl = document.getElementById('primaryColor');

const defaultProject = {
  name: 'مشروعي الأول',
  html: '<div class="gradient-bg" style="min-height:100vh;display:grid;place-items:center;"><button class="pulse-btn" style="padding:14px 20px;border:none;background:#6c5ce7;color:#fff;font-size:18px;border-radius:999px;">زر نابض</button></div>',
  css: 'body{font-family:Cairo,system-ui,sans-serif} .card{padding:12px;border-radius:10px}',
  js: 'console.log("مرحبا من لالولي")',
  uiFont: 'Cairo',
  primary: '#6c5ce7'
};

// Load/Save project to localStorage
function loadProject() {
  const data = JSON.parse(localStorage.getItem('laloly:project') || 'null') || defaultProject;
  htmlEl.value = data.html;
  cssEl.value = data.css;
  jsEl.value = data.js;
  projectNameEl.value = data.name;
  uiFontEl.value = data.uiFont;
  primaryColorEl.value = data.primary;
  renderPreview();
}
function saveProject() {
  const data = {
    name: projectNameEl.value || 'مشروعي',
    html: htmlEl.value,
    css: cssEl.value,
    js: jsEl.value,
    uiFont: uiFontEl.value || 'Cairo',
    primary: primaryColorEl.value || '#6c5ce7'
  };
  localStorage.setItem('laloly:project', JSON.stringify(data));
  addToGallery(data);
}
document.getElementById('saveProject').addEventListener('click', saveProject);
document.getElementById('resetProject').addEventListener('click', () => {
  localStorage.removeItem('laloly:project');
  loadProject();
});

// Live preview
function renderPreview() {
  const doc = `
<!DOCTYPE html><html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1" />
<style> :root{ --primary:${primaryColorEl.value || '#6c5ce7'} } body{font-family:${uiFontEl.value || 'Cairo'}} ${cssEl.value} </style>
</head><body>${htmlEl.value}
<script> ${jsEl.value} </script>
</body></html>`;
  const blob = new Blob([doc], {type: 'text/html'});
  preview.src = URL.createObjectURL(blob);
}
[htmlEl, cssEl, jsEl, uiFontEl, primaryColorEl].forEach(el => el.addEventListener('input', renderPreview));

// Download ZIP
document.getElementById('downloadProject').addEventListener('click', async () => {
  const files = {
    'index.html': `<!DOCTYPE html><html lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${projectNameEl.value}</title><style>${cssEl.value}</style></head><body>${htmlEl.value}<script>${jsEl.value}</script></body></html>`
  };
  // Simple client-side zip using Blob (no external libs): provide .zip-like .laloly file
  const content = JSON.stringify(files, null, 2);
  const blob = new Blob([content], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(projectNameEl.value || 'project').replace(/\s+/g,'_')}.laloly.json`;
  a.click();
});

// Import/Export
document.getElementById('exportProject').addEventListener('click', () => {
  const data = localStorage.getItem('laloly:project');
  if (!data) return alert('لا يوجد مشروع محفوظ');
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'laloly-project.json';
  a.click();
});
document.getElementById('importProject').addEventListener('click', async () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,application/json';
  input.onchange = async () => {
    const file = input.files[0];
    const text = await file.text();
    try {
      const obj = JSON.parse(text);
      localStorage.setItem('laloly:project', JSON.stringify(obj));
      loadProject();
    } catch(e) { alert('ملف غير صالح'); }
  };
  input.click();
});

// Templates loader
async function loadTemplates() {
  try {
    const res = await fetch('data/templates.json');
    const items = await res.json();
    const list = document.getElementById('templateList');
    list.innerHTML = '';
    items.forEach(t => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="thumb">${t.thumbnail ? `<img src="${t.thumbnail}" alt="${t.name}" style="max-width:100%;max-height:88px">` : t.name}</div>
        <h4>${t.name}</h4>
        <p class="muted">${t.desc || ''}</p>
        <div style="display:flex;gap:8px">
          <button class="btn primary" data-id="${t.id}">استيراد</button>
          <button class="btn" data-preview="${t.id}">معاينة</button>
        </div>
      `;
      card.querySelector('[data-id]').addEventListener('click', async () => {
        const tpl = await fetch(t.path).then(r => r.json());
        htmlEl.value = tpl.html || '';
        cssEl.value = tpl.css || '';
        jsEl.value = tpl.js || '';
        projectNameEl.value = t.name;
        renderPreview();
      });
      card.querySelector('[data-preview]').addEventListener('click', async () => {
        const tpl = await fetch(t.path).then(r => r.json());
        const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${tpl.css || ''}</style></head><body>${tpl.html || ''}<script>${tpl.js || ''}</script></body></html>`;
        const blob = new Blob([doc], {type:'text/html'});
        preview.src = URL.createObjectURL(blob);
      });
      list.appendChild(card);
    });
  } catch (e) {
    console.warn('فشل تحميل القوالب', e);
  }
}

// Plugins injection
document.querySelectorAll('.plugin-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const plugin = btn.dataset.plugin;
    const css = await fetch(`plugins/${plugin}`).then(r => r.text());
    cssEl.value = cssEl.value + '\n/* Plugin: '+plugin+' */\n' + css;
    renderPreview();
  });
});

// Challenges
async function loadChallenges() {
  const res = await fetch('data/challenges.json');
  const items = await res.json();
  const ul = document.getElementById('challengeList');
  ul.innerHTML = '';
  items.forEach(ch => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${ch.title}</strong> — ${ch.brief} <button class="btn" data-apply="${ch.id}">تطبيق</button>`;
    li.querySelector('button').addEventListener('click', () => {
      // Apply starter template for challenge
      if (ch.starter) {
        htmlEl.value = ch.starter.html || htmlEl.value;
        cssEl.value = (cssEl.value + '\n' + (ch.starter.css || '')).trim();
        jsEl.value = (jsEl.value + '\n' + (ch.starter.js || '')).trim();
        renderPreview();
      }
      const done = JSON.parse(localStorage.getItem('laloly:challenges') || '[]');
      if (!done.includes(ch.id)) {
        done.push(ch.id);
        localStorage.setItem('laloly:challenges', JSON.stringify(done));
      }
    });
    ul.appendChild(li);
  });
}

// Gallery cards
function addToGallery(data) {
  const gallery = JSON.parse(localStorage.getItem('laloly:gallery') || '[]');
  const id = Date.now();
  gallery.unshift({ id, name: data.name, date: new Date().toISOString() });
  localStorage.setItem('laloly:gallery', JSON.stringify(gallery));
  renderGallery();
}
function renderGallery() {
  const wrap = document.getElementById('projectCards');
  const gallery = JSON.parse(localStorage.getItem('laloly:gallery') || '[]');
  wrap.innerHTML = '';
  gallery.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${item.name}</h4>
      <p class="muted">${new Date(item.date).toLocaleString('ar-EG')}</p>
      <div style="display:flex;gap:8px">
        <button class="btn primary" data-load="${item.id}">تحميل</button>
        <button class="btn danger" data-del="${item.id}">حذف</button>
      </div>
    `;
    card.querySelector('[data-load]').addEventListener('click', () => {
      const project = JSON.parse(localStorage.getItem('laloly:project'));
      if (project) {
        loadProject();
      } else {
        alert('لا يوجد محتوى للمشروع الحالي، احفظ أولاً ثم ادخل للبطاقة.');
      }
    });
    card.querySelector('[data-del]').addEventListener('click', () => {
      const gallery2 = JSON.parse(localStorage.getItem('laloly:gallery') || '[]').filter(g => g.id !== item.id);
      localStorage.setItem('laloly:gallery', JSON.stringify(gallery2));
      renderGallery();
    });
    wrap.appendChild(card);
  });
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  loadProject();
  await loadTemplates();
  await loadChallenges();
  renderGallery();
});

// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
