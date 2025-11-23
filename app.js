if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('SW registered', reg);
      // تحديث تلقائي عند توفر نسخة جديدة
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // هنا يمكنك إعلام المستخدم بوجود تحديث
            console.log('New content available; please refresh.');
          }
        });
      });
    } catch (e) {
      console.error('SW registration failed', e);
    }
  });
}
