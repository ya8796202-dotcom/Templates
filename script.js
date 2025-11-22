function runCode() {
  const html = document.getElementById("htmlCode").value;
  const css = `<style>${document.getElementById("cssCode").value}</style>`;
  const js = `<script>${document.getElementById("jsCode").value}<\/script>`;
  
  const preview = document.getElementById("preview");
  preview.srcdoc = html + css + js;
}

// PWA install button
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
});
