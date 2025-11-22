// تسجيل Service Worker بالمسار الصحيح
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Templates/sw.js');
}

// عند إنشاء المعاينة داخل iframe
function updatePreview() {
  const doc = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>${cssCode.value}</style>
<link rel="stylesheet" href="/Templates/effects.css">
</head>
<body style="padding:12px;background:#0b0f14;color:#e7efff">
${htmlCode.value}
<script>
${jsCode.value}
<\/script>
</body>
</html>`;
  const blob = new Blob([doc], { type: 'text/html' });
  previewFrame.src = URL.createObjectURL(blob);
}
