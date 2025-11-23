// editor.js
const PROJECT_KEY = 'code-editor-pro:project:v1';
const PREVIEW_KEY = 'code-editor-pro:preview:v1';

const defaultFiles = {
  html: `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>مشروعي</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>أهلًا 👋</h1>
  <p>هذه صفحة HTML تجريبية.</p>
</body>
</html>`.trim(),
  css: `body{font-family:system-ui;background:#f8fafc;color:#0f172a;padding:24px}
h1{color:#2563eb} p{opacity:.8}`.trim(),
  js: `console.log("جاهز!")`.trim(),
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello from Main.java");
  }
}`.trim()
};

const els = {
  tabs: document.querySelectorAll('.tab'),
  panes: {
    html: document.getElementById('pane-html'),
    css: document.getElementById('pane-css'),
    js: document.getElementById('pane-js'),
    java: document.getElementById('pane-java'),
  },
  status: document.getElementById('status'),
  btnPreview: document.getElementById('btn-preview'),
  btnSave: document.getElementById('btn-save'),
  btnLoad: document.getElementById('btn-load'),
  btnDownload: document.getElementById('btn-download'),
  btnZip: document.getElementById('btn-zip'),
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
  ed.session.setUseWrapMode(true);
  return ed;
}

function initEditors(initial) {
  editors.html = createEditor('editor-html', 'html');
  editors.css  = createEditor('editor-css',  'css');
  editors.js   = createEditor('editor-js',   'javascript');
  editors.java = createEditor('editor-java', 'java');

  editors.html.setValue(initial.html, -1);
  editors.css.setValue(initial.css, -1);
  editors.js.setValue(initial.js, -1);
  editors.java.setValue(initial.java, -1);
}

function setStatus(msg, type='info') {
  els.status.textContent = msg;
  if (type === 'ok') els.status.style.color = 'var(--ok)';
  else if (type === 'warn') els.status.style.color = 'var(--warn)';
  else els.status.style.color = 'var(--muted)';
}

function switchTab(name) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  if (els.panes[name]) els.panes[name].classList.add('active');
  els.tabs.forEach(t => t.classList.toggle('active', t.dataset.target === name));
  // إعادة تركيز المحرر الظاهر
  const edKey = name === 'java' ? 'java' : name;
  setTimeout(()=>{ editors[edKey].resize(); editors[edKey].focus(); }, 50);
}

function saveProject() {
  const data = {
    html: editors.html.getValue(),
    css: editors.css.getValue(),
    js: editors.js.getValue(),
    java: editors.java.getValue(),
    updatedAt: Date.now()
  };
  localStorage.setItem(PROJECT_KEY, JSON.stringify(data));
  setStatus('تم الحفظ محليًا ✔', 'ok');
}

function loadProject() {
  const raw = localStorage.getItem(PROJECT_KEY);
  if (!raw) { setStatus('لا توجد نسخة محفوظة', 'warn'); return null; }
  const data = JSON.parse(raw);
  editors.html.setValue(data.html || '', -1);
  editors.css.setValue(data.css || '', -1);
  editors.js.setValue(data.js || '', -1);
  editors.java.setValue(data.java || '', -1);
  setStatus('تم الاسترجاع', 'ok');
  return data;
}

function buildDocument() {
  const html = editors.html.getValue();
  const css  = editors.css.getValue();
  const js   = editors.js.getValue();
  const finalDoc = `
${html}
<style>${css}</style>
<script>${js}<\/script>
`.trim();
  return finalDoc;
}

function previewInPage() {
  const doc = buildDocument();
  // نخزن في مفتاح ثابت في localStorage عشان preview.html يقرأه حتى لو فتحت مباشرة
  localStorage.setItem(PREVIEW_KEY, doc);
  // نضع علامة زمنية لتتبع آخر معاينة
  localStorage.setItem(PREVIEW_KEY + ':ts', Date.now().toString());
  // ننتقل لصفحة المعاينة بنفس المسار النسبي
  location.href = './preview.html';
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

async function downloadZip() {
  // توليد ZIP بسيط بدون مكتبات: نستخدم Blob و ZIP عبر JSZip لو متاح، لكن هنا نعمل ZIP بسيط عبر Blob + form-data غير ممكن.
  // بديل عملي: نولد ملف مضغوط باستخدام JSZip CDN لو حبيت تضيفه. هنا سننزل ملف HTML + CSS + JS منفصلين داخل مجلد مضغوط باستخدام JSZip إن وُجد.
  if (typeof JSZip === 'undefined') {
    // تحميل JSZip مؤقتًا ثم إعادة المحاولة
    try {
      await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
    } catch (e) {
      setStatus('لا يمكن تنزيل ZIP: فشل تحميل JSZip', 'warn');
      return;
    }
  }
  const zip = new JSZip();
  zip.file('index.html', editors.html.getValue());
  zip.file('styles.css', editors.css.getValue());
  zip.file('script.js', editors.js.getValue());
  zip.file('Main.java', editors.java.getValue());
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus('تم تنزيل ZIP', 'ok');
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
    'https://cdn.jsdelivr.net/npm/ace-builds@1.32.3/src-min/ext-language_tools.js'
  ];
  urls.forEach(u => fetch(u).catch(()=>{}));
}

// Events
els.tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.target));
});
els.btnSave.addEventListener('click', saveProject);
els.btnLoad.addEventListener('click', loadProject);
els.btnPreview.addEventListener('click', previewInPage);
els.btnDownload.addEventListener('click', downloadHTML);
els.btnZip.addEventListener('click', downloadZip);
els.btnTheme.addEventListener('click', toggleTheme);
els.fontSize.addEventListener('change', setFontSize);

// Init
const stored = localStorage.getItem(PROJECT_KEY);
initEditors(stored ? JSON.parse(stored) : defaultFiles);
switchTab('html');
setStatus('جاهز');
setFontSize();
cacheCdnForOffline();

// Auto-save كل دقيقة (اختياري)
let autoSaveTimer = setInterval(() => {
  saveProject();
}, 60_000);
