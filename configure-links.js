(() => {
 const config = window.PORTAL_CONFIG || {};
 const valid = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
 const notebooks = (config.notebooks || []).filter(item => valid(item.url));
 const select = document.getElementById('notebook-select');
 select.replaceChildren();
 notebooks.forEach(item => select.add(new Option(item.label || 'Notebook', item.url)));
 if (!notebooks.length) select.add(new Option('Set up your notebook links above', ''));
 select.disabled = !notebooks.length;
 document.querySelector('#notebook-launcher button').disabled = !notebooks.length;
 document.querySelectorAll('[data-primary-notebook]').forEach(link => { link.href = notebooks[0]?.url || 'https://notebook.google.com/'; });
 const container = document.getElementById('personal-links');
 container.replaceChildren();
 (config.oneNoteLinks || []).filter(item => valid(item.url)).forEach(item => {
  const link = document.createElement('a');
  link.className = 'button'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener';
  link.textContent = (item.label || 'OneNote notebook') + ' ↗'; container.append(link);
 });
})();
