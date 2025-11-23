// /Templates/assets/editor.js
const stateKey = 'code-editor-pro:v1';

const defaultFiles = {
  html: `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>مشروعي</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>أهلًا يا ياسر 👋</h1>
  <p>هذه صفحة HTML التجريبية.</p>
</body>
</html>`.trim(),
  css: `body{font-family:system-ui;background:#f8fafc;color:#0f172a;padding:24px}
h1{color:#2563eb} p{opacity:.8}`.trim(),
  js: `console.log("جاهز!")`.trim(),
};

const els = {
  tabs: document.querySelectorAll('.tab'),
  panes: {
    html: document.getElementById('pane-html'),
    css: document.getElementById('pane-css'),
    js: document.getElementById('pane-js'),
  },
  status: document.getElementById('status'),
  btnPreview: document.getElementById('btn-preview'),
  btnSave: document.getElementById('btn-save'),
  btnLoad: document.getElementById('btn-load'),
  btnDownload: document.getElementById('btn-download'),
  btnTheme: document.getElementById('btn-theme'),
  fontSize: document.getElementById('font-size'),
};

let editors = {};
function createEditor(id, mode) {
  const ed = ace.edit(id, {
    mode: `ace/mode/${mode}`,
    theme: 'ace/theme/one_dark',
    fontSize: parseInt(els.fontSize.value, 10),
    tabSize: 2,
    useSoftTabs: true,
    wrap: true,
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });
  return ed;
}

function initEditors(initial) {
  editors.html = createEditor('editor-html', 'html');
  editors.css  = createEditor('editor-css',  'css');
  editors.js   = createEditor('editor-js',   'javascript');

  editors.html.setValue(initial.html, -1);
  editors.css.setValue(initial.css, -1);
  editors.js.setValue(initial.js, -1);
}

function setStatus(msg, type='info') {
  els.status.textContent = msg;
  if (type === 'ok') els.status.style.color = 'var(--ok)';
  else if (type === 'warn') els.status.style.color = 'var(--warn)';
  else els.status.style.color = 'var(--muted)';
}

function switchTab(name) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  els.panes[name].classList.add('active');
  els.tabs.forEach(t => t.classList.toggle('active', t.dataset.target === name));
}

function saveState() {
  const data = {
    html: editors.html.getValue(),
    css: editors.css.getValue(),
    js: editors.js.getValue()
  };
  localStorage.setItem(stateKey, JSON.stringify(data));
  setStatus('تم الحفظ محليًا ✔', 'ok');
}

function loadState() {
  const raw = localStorage.getItem(stateKey);
  if (!raw) { setStatus('لا توجد نسخة محفوظة', 'warn'); return; }
  const data = JSON.parse(raw);
  editors.html.setValue(data.html || '', -1);
  editors.css.setValue(data.css || '', -1);
  editors.js.setValue(data.js || '', -1);
  setStatus('تم الاسترجاع', 'ok');
}

function buildDocument() {
  const html = editors.html.getValue();
  const css  = editors.css.getValue();
  const js   = editors.js.getValue();
  const finalDoc = `
${html}
<style>${css}</style>
<script>${js}</script>
`.trim();
  return finalDoc;
}

function previewInPage() {
  const doc = buildDocument();
  sessionStorage.setItem('previewDocument', doc);
  location.href = 'preview.html';
}

function downloadHTML() {
  const doc = buildDocument();
  const blob = new Blob([doc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus('تم تنزيل الملف', 'ok');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  els.btnTheme.textContent = `الوضع: ${isLight ? 'فاتح' : 'داكن'}`;
  const theme = isLight ? 'ace/theme/chrome' : 'ace/theme/one_dark';
  Object.values(editors).forEach(ed => ed.setTheme(theme));
}

function setFontSize() {
  const size = parseInt(els.fontSize.value, 10);
  Object.values(editors).forEach(ed => ed.setFontSize(size));
}

function cacheCdnForOffline() {
  const urls = [
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/ace.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/ext-language_tools.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/mode-html.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/mode-css.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/mode-javascript.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/theme-one_dark.js',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/theme-chrome.js',
  ];
  urls.forEach(u => fetch(u).catch(()=>{}));
}

// Events
els.tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.target));
});
els.btnSave.addEventListener('click', saveState);
els.btnLoad.addEventListener('click', loadState);
els.btnPreview.addEventListener('click', previewInPage);
els.btnDownload.addEventListener('click', downloadHTML);
els.btnTheme.addEventListener('click', toggleTheme);
els.fontSize.addEventListener('change', setFontSize);

// Init
const stored = localStorage.getItem(stateKey);
initEditors(stored ? JSON.parse(stored) : defaultFiles);
switchTab('html');
setStatus('جاهز');
setFontSize();
cacheCdnForOffline();
