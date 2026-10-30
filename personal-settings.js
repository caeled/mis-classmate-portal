(() => {
 const key = 'mis-classmate-personal-links-v1';
 const defaults = window.PORTAL_CONFIG;
 try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Array.isArray(saved.notebooks) && Array.isArray(saved.oneNoteLinks)) {
   window.PORTAL_CONFIG = {...defaults, notebooks:saved.notebooks, oneNoteLinks:saved.oneNoteLinks};
  }
 } catch {}
 window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('personal-settings');
  const rows = document.getElementById('settings-rows');
  const status = document.getElementById('settings-status');
  function addRow(kind, item = {}) {
   const row = document.createElement('div'); row.className = 'settings-row'; row.dataset.kind = kind;
   const label = document.createElement('input'); label.placeholder = 'Name'; label.value = item.label || ''; label.setAttribute('aria-label', kind + ' name');
   const url = document.createElement('input'); url.type = 'url'; url.placeholder = 'https://…'; url.value = item.url || ''; url.setAttribute('aria-label', kind + ' URL');
   const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => row.remove());
   const type = document.createElement('span'); type.textContent = kind === 'notebooks' ? 'NotebookLM' : 'OneNote';
   row.append(type, label, url, remove); rows.append(row);
  }
  ['notebooks','oneNoteLinks'].forEach(kind => (window.PORTAL_CONFIG[kind] || []).forEach(item => addRow(kind,item)));
  document.getElementById('add-notebook').onclick = () => addRow('notebooks');
  document.getElementById('add-onenote').onclick = () => addRow('oneNoteLinks');
  form.addEventListener('submit', event => {
   event.preventDefault();
   const data = {notebooks:[],oneNoteLinks:[]};
   for (const row of rows.children) {
    const [label,url] = row.querySelectorAll('input'); const value = url.value.trim();
    if (!value) continue;
    try { if (new URL(value).protocol !== 'https:') throw new Error(); }
    catch { status.textContent = 'Please use a complete HTTPS URL for each link.'; url.focus(); return; }
    data[row.dataset.kind].push({label:label.value.trim() || 'My notebook',url:value});
   }
   try { localStorage.setItem(key,JSON.stringify(data)); location.reload(); }
   catch { status.textContent = 'Browser storage is unavailable. Your settings could not be saved.'; }
  });
 });
})();
