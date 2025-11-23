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
    tabSize
