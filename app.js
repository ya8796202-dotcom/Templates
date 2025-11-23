require.config({
  paths: { "vs": "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" }
});

let editor;

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: `<!DOCTYPE html>
<html>
<head>
<title>Preview</title>
<style>
body { background:#222; color:white; font-family:Arial; }
</style>
</head>
<body>
<h1>Hello CodeStudio Pro!</h1>
</body>
</html>`,
    language: "html",
    theme: "vs-dark",
    automaticLayout: true
  });
});

function updatePreview() {
  const iframe = document.getElementById("previewFrame");
  const code = editor.getValue();
  iframe.srcdoc = code;
}

setInterval(updatePreview, 500);
