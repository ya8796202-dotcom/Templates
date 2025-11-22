document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const editors = document.querySelectorAll("textarea");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      editors.forEach(area => area.style.display = "none");
      const targetId = tab.getAttribute("data-target");
      document.getElementById(targetId).style.display = "block";
    });
  });
});

// Run code
function runCode() {
  const html = document.getElementById("htmlCode").value;
  const css = `<style>${document.getElementById("cssCode").value}</style>`;
  const js = `<script>${document.getElementById("jsCode").value}<\/script>`;
  const preview = document.getElementById("preview");
  preview.srcdoc = html + css + js;
  preview.style.height = "100%";
}

// Save code offline
["htmlCode","cssCode","jsCode"].forEach(id => {
  const el = document.getElementById(id);
  el.value = localStorage.getItem(id) || "";
  el.addEventListener("input", () => {
    localStorage.setItem(id, el.value);
  });
});

// Download project
function downloadProject() {
  const html = document.getElementById("htmlCode").value;
  const css = `<style>${document.getElementById("cssCode").value}</style>`;
  const js = `<script>${document.getElementById("jsCode").value}<\/script>`;
  const blob = new Blob([html + css + js], {type: "text/html"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project.html";
  link.click();
}

// Dark/Light mode toggle
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// PWA install
let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});
installBtn.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => deferredPrompt = null);
  }
});
