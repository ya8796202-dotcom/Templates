// preview.js
const PREVIEW_KEY = 'code-editor-pro:preview:v1';
const iframe = document.getElementById('preview-frame');
const backBtn = document.getElementById('back-to-editor');
const openNew = document.getElementById('open-new-window');

function loadPreview() {
  const doc = localStorage.getItem(PREVIEW_KEY);
  if (!doc) {
    iframe.srcdoc = `<html lang="ar"><body style="font-family:system-ui;padding:24px">
      <h2>لا يوجد محتوى للمعاينة</h2>
      <p>ارجع للمحرر واضغط "معاينة" لعرض مشروعك هنا.</p>
    </body></html>`;
    return;
  }
  iframe.srcdoc = doc;
}

// عند الضغط على "عودة للمحرر" نرجع للـ index.html بنفس المسار
backBtn.addEventListener('click', (e) => {
  // نستخدم href العادي؛ لا حاجة لشيء إضافي
  // لكن نضيف علامة زمنية صغيرة لتأكيد أن العودة من المعاينة
  localStorage.setItem('code-editor-pro:fromPreview', Date.now().toString());
});

// فتح المعاينة في نافذة جديدة (مفيد للاختبار)
openNew.addEventListener('click', () => {
  const doc = localStorage.getItem(PREVIEW_KEY);
  const w = window.open();
  if (!w) return;
  w.document.open();
  w.document.write(doc || '<p>لا يوجد محتوى</p>');
  w.document.close();
});

loadPreview();
