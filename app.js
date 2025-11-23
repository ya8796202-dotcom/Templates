// Mode toggle + install
let deferredPrompt=null;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;installBtn.style.display='inline-block';});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;});
const modeToggle=document.getElementById('modeToggle');
const savedMode=localStorage.getItem('pro:mode')||'dark';
document.documentElement.className=savedMode;
modeToggle.textContent=savedMode==='dark'?'الوضع الفاتح':'الوضع الداكن';
modeToggle.addEventListener('click',()=>{const next=document.documentElement.className==='dark'?'light':'dark';document.documentElement.className=next;modeToggle.textContent=next==='dark'?'الوضع الفاتح':'الوضع الداكن';localStorage.setItem('pro:mode',next);});

// Project model
const DEFAULT_FILES=[
  {name:'index.html',type:'html',content:'<main class="container"><h1>أهلاً يا ياسر</h1><p>ابدأ هنا</p></main>'},
  {name:'styles.css',type:'css',content:'body{font-family:Cairo,system-ui,sans-serif}.container{padding:24px}'},
  {name:'script.js',type:'js',content:'console.log("لالولي برو يعمل ✨")'}
];
const state={
  projectName: localStorage.getItem('pro:name')||'مشروعي البرو',
  files: JSON.parse(localStorage.getItem('pro:files')||'null') || DEFAULT_FILES,
  activeIndex: 0,
  autoRun: JSON.parse(localStorage.getItem('pro:autoRun')||'true'),
  uiFont: localStorage.getItem('pro:font')||'Cairo',
  primary: localStorage.getItem('pro:primary')||'#6c5ce7'
};

// Elements
const fileList=document.getElementById('fileList');
const tabs=document.getElementById('tabs');
const codeArea=document.getElementById('codeArea');
const status=document.getElementById('status');
const cursorPos=document.getElementById('cursorPos');
const fileMeta=document.getElementById('fileMeta');
const previewFrame=document.getElementById('previewFrame');
const consoleEl=document.getElementById('console');
const runBtn=document.getElementById('runBtn');
const autoRunEl=document.getElementById('autoRun');
const newFileBtn=document.getElementById('newFile');
const projectNameEl=document.getElementById('projectName');
const uiFontEl=document.getElementById('uiFont');
const primaryColorEl=document.getElementById('primaryColor');

// Render file list and tabs
function renderFiles(){
  // List
  fileList.innerHTML='';
  state.files.forEach((f,i)=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${f.name}</span>
      <span>
        <button class="btn" data-rename="${i}">إعادة تسمية</button>
        <button class="btn danger" data-del="${i}">حذف</button>
      </span>`;
    if(i===state.activeIndex) li.classList.add('active');
    li.addEventListener('click',()=>{state.activeIndex=i;renderEditor();});
    li.querySelector('[data-rename]').addEventListener('click',(e)=>{e.stopPropagation();const nn=prompt('اسم جديد',f.name);if(nn){f.name=nn;persist();renderFiles();}});
    li.querySelector('[data-del]').addEventListener('click',(e)=>{e.stopPropagation();if(state.files.length<=1) return alert('يجب أن يبقى ملف واحد على الأقل');state.files.splice(i,1);state.activeIndex=0;persist();renderFiles();renderEditor();});
    fileList.appendChild(li);
  });
  // Tabs
  tabs.innerHTML='';
  state.files.forEach((f,i)=>{
    const t=document.createElement('button');
    t.className='tab'+(i===state.activeIndex?' active':'');
    t.textContent=f.type.toUpperCase();
    t.title=f.name;
    t.addEventListener('click',()=>{state.activeIndex=i;renderEditor();});
    tabs.appendChild(t);
  });
}

// Editor and preview
function renderEditor(){
  const f=state.files[state.activeIndex];
  codeArea.value=f.content;
  fileMeta.textContent=`UTF-8 • ${f.type.toUpperCase()}`;
  status.textContent=`تحرير: ${f.name}`;
  updateCursor();
  if(state.autoRun) debounceRun();
}
function buildDoc(){
  const html = getFile('html')?.content || '';
  const css  = getFile('css')?.content || '';
  const js   = getFile('js')?.content || '';
  const doc = `<!DOCTYPE html><html lang="ar"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{--primary:${state.primary}} body{font-family:${state.uiFont}} ${css}</style>
</head><body>${html}
<script>
const __log=(...args)=>parent.postMessage({type:'console',data:args},'*');
['log','warn','error','info'].forEach(m=>{const _c=console[m];console[m]=function(){__log({level:m,args:[...arguments]});_c.apply(console,arguments)}}); 
${js}
</script>
</body></html>`;
  return doc;
}
function run(){
  const blob=new Blob([buildDoc()],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  previewFrame.src=url;
  consoleEl.innerHTML='';
  status.textContent='تم التشغيل';
}
let runTimer=null;
function debounceRun(){clearTimeout(runTimer);runTimer=setTimeout(run,250);}
function getFile(type){return state.files.find(f=>f.type===type);}
function persist(){
  localStorage.setItem('pro:name',state.projectName);
  localStorage.setItem('pro:files',JSON.stringify(state.files));
  localStorage.setItem('pro:autoRun',JSON.stringify(state.autoRun));
  localStorage.setItem('pro:font',state.uiFont);
  localStorage.setItem('pro:primary',state.primary);
}

// Inputs
codeArea.addEventListener('input',()=>{
  const f=state.files[state.activeIndex];
  f.content=codeArea.value;
  persist();
  state.autoRun && debounceRun();
});
codeArea.addEventListener('keyup',updateCursor);
codeArea.addEventListener('click',updateCursor);
function updateCursor(){
  const pos=codeArea.selectionStart;
  const lines=codeArea.value.slice(0,pos).split('\n');
  const ln=lines.length; const col=lines[lines.length-1].length+1;
  cursorPos.textContent=`Ln ${ln}, Col ${col}`;
}

// Preview messages
window.addEventListener('message',(e)=>{
  const msg=e.data;
  if(msg && msg.type==='console'){
    const {level,args}=msg.data;
    const line=document.createElement('div');
    line.textContent=`[${level}] ${args.map(a=>typeof a==='object'?JSON.stringify(a):a).join(' ')}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop=consoleEl.scrollHeight;
  }
});

// Auto-run toggle
autoRunEl.checked=state.autoRun;
autoRunEl.addEventListener('change',()=>{state.autoRun=autoRunEl.checked;persist();});

// Run button
runBtn.addEventListener('click',run);

// New file
newFileBtn.addEventListener('click',()=>{
  const name=prompt('اسم الملف (مثلاً: component.html أو utils.js)');
  if(!name) return;
  const ext=name.split('.').pop().toLowerCase();
  const type = ext==='html'?'html':ext==='css'?'css':'js';
  state.files.push({name,type,content:type==='html'?'<!-- ملف HTML جديد -->':type==='css'?'/* ملف CSS جديد */':'// ملف JS جديد'});
  state.activeIndex=state.files.length-1;
  persist(); renderFiles(); renderEditor();
});

// Export/Import
document.getElementById('exportProject').addEventListener('click',()=>{
  const data=JSON.stringify({name:state.projectName,files:state.files,meta:{font:state.uiFont,primary:state.primary}},null,2);
  const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${state.projectName.replace(/\s+/g,'_')}.laloly.pro.json`; a.click();
});
document.getElementById('importProject').addEventListener('click',()=>{
  const input=document.createElement('input'); input.type='file'; input.accept='application/json,.json';
  input.onchange=async()=>{const file=input.files[0];const txt=await file.text();try{const obj=JSON.parse(txt);state.projectName=obj.name||state.projectName;state.files=obj.files||state.files;if(obj.meta){state.uiFont=obj.meta.font||state.uiFont;state.primary=obj.meta.primary||state.primary;}persist();projectNameEl.value=state.projectName;uiFontEl.value=state.uiFont;primaryColorEl.value=state.primary;renderFiles();renderEditor();}catch(e){alert('ملف غير صالح');}};
  input.click();
});

// Download individual files
document.getElementById('downloadFiles').addEventListener('click',()=>{
  state.files.forEach(f=>{
    const blob=new Blob([f.content],{type:'text/plain'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=f.name; a.click();
  });
});

// Settings bind
projectNameEl.value=state.projectName;
uiFontEl.value=state.uiFont;
primaryColorEl.value=state.primary;
projectNameEl.addEventListener('input',()=>{state.projectName=projectNameEl.value;persist();});
uiFontEl.addEventListener('input',()=>{state.uiFont=uiFontEl.value;persist(); state.autoRun && debounceRun();});
primaryColorEl.addEventListener('input',()=>{state.primary=primaryColorEl.value;persist(); state.autoRun && debounceRun();});
document.getElementById('resetProject').addEventListener('click',()=>{
  if(!confirm('إعادة المشروع؟')) return;
  state.projectName='مشروعي البرو'; state.files=[...DEFAULT_FILES]; state.activeIndex=0;
  persist(); renderFiles(); renderEditor();
});

// Snippets
const snippetList=document.getElementById('snippetList');
const snippetSearch=document.getElementById('snippetSearch');
async function loadSnippets(){
  try{
    const res=await fetch('data/snippets.json'); const all=await res.json();
    renderSnippets(all);
    snippetSearch.addEventListener('input',()=>{const q=snippetSearch.value.trim();renderSnippets(all.filter(s=>s.name.includes(q)||s.tags?.some(t=>t.includes(q))));});
  }catch(e){snippetList.innerHTML='<li class="muted">لا توجد سنِبتس</li>';}
}
function renderSnippets(list){
  snippetList.innerHTML='';
  list.forEach(s=>{
    const li=document.createElement('li');
    li.innerHTML=`<strong>${s.name}</strong> <button class="btn" data-insert="${s.id}">إدراج</button>`;
    li.querySelector('button').addEventListener('click',()=>{
      const f=state.files[state.activeIndex];
      f.content = f.content + '\n' + (s[state.files[state.activeIndex].type] || '');
      persist(); renderEditor();
    });
    snippetList.appendChild(li);
  });
}

// Keyboard shortcuts
document.addEventListener('keydown',(e)=>{
  const meta=e.ctrlKey||e.metaKey;
  if(meta && e.key.toLowerCase()==='s'){e.preventDefault();persist();status.textContent='تم الحفظ';}
  if(meta && e.key.toLowerCase()==='r'){e.preventDefault();run();}
  if(meta && ['1','2','3'].includes(e.key)){e.preventDefault();const map={'1':'html','2':'css','3':'js'};const idx=state.files.findIndex(f=>f.type===map[e.key]);if(idx>-1){state.activeIndex=idx;renderEditor();}}
});

// Init
window.addEventListener('DOMContentLoaded',()=>{
  renderFiles(); renderEditor(); loadSnippets();
  if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
});
