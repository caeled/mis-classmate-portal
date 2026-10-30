const storagePrefix = (window.PORTAL_CONFIG?.storageKey || 'mis') + '-';
const fields=[...document.querySelectorAll('[data-note]')];
fields.forEach(field=>{
 const status=field.nextElementSibling;
 try{field.value=localStorage.getItem(storagePrefix + 'notes-'+field.dataset.note)||'';}catch{status.textContent='Browser storage unavailable. Export notes before closing.';}
 field.addEventListener('input',()=>{try{localStorage.setItem(storagePrefix + 'notes-'+field.dataset.note,field.value);status.textContent='Saved in this browser. Export notes for a portable backup.';}catch{status.textContent='Could not save locally. Export notes before closing.';}});
});
document.getElementById('export').addEventListener('click',()=>{
 const text='# MIS Program — Study Notes\n\n'+fields.map(f=>'## '+f.closest('article').querySelector('h3').textContent+'\n\n'+(f.value||'(No notes yet)')).join('\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='MIS-study-notes.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

const currentTab = document.getElementById('current-tab');
const notebookSelect = document.getElementById('notebook-select');
function updateLinkTargets() {
 document.querySelectorAll('a[target]').forEach(link => {
  link.target = currentTab.checked ? '_self' : '_blank';
 });
}
try {
 currentTab.checked = localStorage.getItem(storagePrefix + 'current-tab') === 'true';
 const selected = localStorage.getItem(storagePrefix + 'selected-notebook');
 if ([...notebookSelect.options].some(option => option.value === selected)) notebookSelect.value = selected;
} catch {}
updateLinkTargets();
currentTab.addEventListener('change', () => {
 updateLinkTargets();
 try { localStorage.setItem(storagePrefix + 'current-tab', String(currentTab.checked)); } catch {}
});
notebookSelect.addEventListener('change', () => {
 try { localStorage.setItem(storagePrefix + 'selected-notebook', notebookSelect.value); } catch {}
});
document.getElementById('notebook-launcher').addEventListener('submit', event => {
 event.preventDefault();
 if (!notebookSelect.value) return;
 if (currentTab.checked) window.location.assign(notebookSelect.value);
 else window.open(notebookSelect.value, '_blank', 'noopener,noreferrer');
});
