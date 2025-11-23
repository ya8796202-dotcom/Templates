document.addEventListener('DOMContentLoaded', () => {
    const htmlCode = document.getElementById('html-code');
    const cssCode = document.getElementById('css-code');
    const jsCode = document.getElementById('js-code');
    const previewFrame = document.getElementById('preview-frame');

    // دالة تحديث المُعاينة
    function updatePreview() {
        // جمع الأكواد
        const html = htmlCode.value;
        const css = `<style>${cssCode.value}</style>`;
        const js = `<script>${jsCode.value}</script>`;

        // دمج الأكواد في هيكل HTML واحد
        const finalCode = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${css}
            </head>
            <body>
                ${html}
                ${js}
            </body>
            </html>
        `;

        // كتابة الكود داخل الـiframe للمعاينة
        previewFrame.srcdoc = finalCode;

        // حفظ الأكواد في التخزين المحلي
        localStorage.setItem('htmlCode', html);
        localStorage.setItem('cssCode', cssCode.value);
        localStorage.setItem('jsCode', jsCode.value);
    }

    // تحميل الأكواد المحفوظة عند فتح التطبيق
    function loadSavedCode() {
        htmlCode.value = localStorage.getItem('htmlCode') || '';
        cssCode.value = localStorage.getItem('cssCode') || '';
        jsCode.value = localStorage.getItem('jsCode') || '';
        updatePreview(); // تحديث المُعاينة بعد التحميل
    }
    
    // ربط حدث الإدخال (كل ضغطة زر) بدالة التحديث
    htmlCode.addEventListener('input', updatePreview);
    cssCode.addEventListener('input', updatePreview);
    jsCode.addEventListener('input', updatePreview);

    // تحميل الأكواد المحفوظة فوراً
    loadSavedCode();
});
