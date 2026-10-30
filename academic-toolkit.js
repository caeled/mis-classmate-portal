// Academic Toolkit: competency tracking, APA 7 sources, draft rigor checks,
// AI-use disclosure log, and spaced-repetition flashcards.
// Everything is stored only in this browser (localStorage). Use Backup to export.
(() => {
 const P = (window.PORTAL_CONFIG?.storageKey || 'mis') + '-tk-';
 const COURSES = [
  ['CMGTCB/554','IT Infrastructure'],
  ['CMGTCB/555','Systems Analysis and Development'],
  ['CMGTCB/556','Enterprise Models'],
  ['BSACB/531','IT Architecture in the Age of Cloud'],
  ['CMGTCB/545','Influence and Leadership in Technology'],
  ['CMGTCB/575','CIS Project Management'],
  ['CMGTCB/558','Strategic Management of Technology and Innovation'],
  ['CMGTCB/578','CIS Strategic Planning'],
  ['CMGTCB/582','Security and Ethics'],
  ['DATCB/565','Data Analysis and Business Analytics'],
  ['CMGTCB/559','Managing Risk and Security vs. Opportunity'],
  ['CMGTCB/583','IS Integration']
 ];
 const STATUSES = ['Not started','Learning','Ready to assess','Mastered'];
 const load = (k, d) => { try { return JSON.parse(localStorage.getItem(P + k)) ?? d; } catch { return d; } };
 const save = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch { return false; } };
 const $ = (s, r = document) => r.querySelector(s);
 const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); kids.flat().forEach(k => n.append(k)); return n; };
 const courseOptions = (sel) => COURSES.map(([c, t]) => el('option', {value: c, textContent: c + ' · ' + t, selected: c === sel}));
 const today = () => new Date().toISOString().slice(0, 10);
 const download = (name, text, type) => { const u = URL.createObjectURL(new Blob([text], {type})); const a = el('a', {href: u, download: name}); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
 const copy = async (text, statusEl) => { try { await navigator.clipboard.writeText(text); statusEl.textContent = 'Copied.'; } catch { statusEl.textContent = 'Copy blocked by the browser. Select the text and copy it manually.'; } };

 /* ---------- Tabs ---------- */
 const tabs = [...document.querySelectorAll('.tk-tab')];
 tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { x.setAttribute('aria-selected', x === t); $('#' + x.getAttribute('aria-controls')).hidden = x !== t; });
  save('tab', t.id);
 }));
 const lastTab = document.getElementById(load('tab', 'tk-tab-comp'));
 (lastTab || tabs[0])?.click();

 /* ---------- 1. Competency tracker ---------- */
 let comp = load('competencies', {});
 const compList = $('#tk-comp-list');
 const openCourses = new Set();
 function renderComp() {
  compList.replaceChildren();
  let mastered = 0, ready = 0;
  COURSES.forEach(([code, title]) => {
   const c = comp[code] ||= {items: [{text:'',status:0,evidence:''},{text:'',status:0,evidence:''},{text:'',status:0,evidence:''}]};
   c.items.forEach(i => { if (i.status === 3) mastered++; if (i.status === 2) ready++; });
   const done = c.items.filter(i => i.status === 3).length;
   const rows = c.items.map((item, idx) => {
    const status = el('select', {className: 'tk-status s' + item.status, 'aria-label': 'Status'}, STATUSES.map((s, n) => el('option', {value: n, textContent: s, selected: n === item.status})));
    status.onchange = () => { item.status = +status.value; save('competencies', comp); renderComp(); };
    const text = el('input', {value: item.text, placeholder: 'Competency ' + (idx + 1) + ': paste the statement from your course', 'aria-label': 'Competency statement'});
    text.oninput = () => { item.text = text.value; save('competencies', comp); };
    const ev = el('textarea', {value: item.evidence, rows: 2, placeholder: 'Evidence: what you did, the artifact or link, and the result. Tie it to the competency wording.', 'aria-label': 'Evidence'});
    ev.oninput = () => { item.evidence = ev.value; save('competencies', comp); warn.hidden = !(item.status >= 2 && item.evidence.trim().length < 40); };
    const warn = el('small', {className: 'tk-warn', textContent: 'Thin evidence for an assessment-ready competency. Add a concrete artifact and outcome.', hidden: !(item.status >= 2 && item.evidence.trim().length < 40)});
    return el('div', {className: 'tk-comp-row'}, el('div', {className: 'tk-comp-top'}, text, status), ev, warn);
   });
   const det = el('details', {className: 'tk-course', open: openCourses.has(code)});
   det.addEventListener('toggle', () => det.open ? openCourses.add(code) : openCourses.delete(code));
   compList.append(det); det.append(
    el('summary', {}, el('span', {className: 'tk-code', textContent: code}), ' ' + title, el('b', {className: 'tk-count', textContent: done + '/3'})),
    ...rows);
  });
  $('#tk-comp-bar').style.width = (mastered / 36 * 100) + '%';
  $('#tk-comp-summary').textContent = mastered + ' of 36 competencies mastered · ' + ready + ' ready to assess';
 }
 renderComp();

 /* ---------- 2. Sources + APA 7 ---------- */
 let sources = load('sources', []);
 const sf = $('#tk-source-form');
 $('#tk-src-course').append(el('option', {value: '', textContent: 'Any course'}), ...courseOptions());
 const fmtAuthors = raw => {
  const list = raw.split(';').map(s => s.trim()).filter(Boolean).map(a => {
   if (!a.includes(',')) return a; // organization or single name
   const [last, given] = a.split(',').map(s => s.trim());
   const initials = given.split(/[\s.]+/).filter(Boolean).map(g => g.split('-').map(p => p[0].toUpperCase() + '.').join('-')).join(' ');
   return last + ', ' + initials;
  });
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length <= 20) return list.slice(0, -1).join(', ') + ', & ' + list.at(-1);
  return list.slice(0, 19).join(', ') + ', . . . ' + list.at(-1);
 };
 const end = s => /[.?!]$/.test(s) ? s : s + '.';
 const sentenceCase = s => s; // APA wants sentence case; left to the writer, flagged below
 function apa(s) {
  const au = fmtAuthors(s.authors);
  const date = '(' + (s.year || 'n.d.') + ').';
  const parts = [];
  if (s.type === 'journal') {
   const vol = s.volume ? ', <i>' + esc(s.volume) + '</i>' : '';
   const iss = s.issue ? '(' + esc(s.issue) + ')' : '';
   const pg = s.pages ? ', ' + esc(s.pages) : '';
   parts.push(esc(au ? end(au) : ''), date, esc(end(sentenceCase(s.title))), '<i>' + esc(s.container) + '</i>' + vol + iss + pg + '.');
  } else if (s.type === 'book') {
   parts.push(esc(au ? end(au) : ''), date, '<i>' + esc(end(s.title)) + '</i>', esc(s.container ? end(s.container) : ''));
  } else if (s.type === 'report') {
   parts.push(esc(au ? end(au) : ''), date, '<i>' + esc(end(s.title)) + '</i>', esc(s.container && s.container !== s.authors ? end(s.container) : ''));
  } else {
   parts.push(esc(au ? end(au) : ''), date, '<i>' + esc(end(s.title)) + '</i>', esc(s.container && s.container !== s.authors ? end(s.container) : ''));
  }
  if (s.url) parts.push(esc(s.url));
  return parts.filter(Boolean).join(' ');
 }
 function inText(s) {
  const names = s.authors.split(';').map(a => a.split(',')[0].trim()).filter(Boolean);
  const y = s.year || 'n.d.';
  if (!names.length) return '(' + (s.title.split(' ').slice(0, 4).join(' ')) + ', ' + y + ')';
  if (names.length === 1) return '(' + names[0] + ', ' + y + ')';
  if (names.length === 2) return '(' + names[0] + ' & ' + names[1] + ', ' + y + ')';
  return '(' + names[0] + ' et al., ' + y + ')';
 }
 function esc(t) { return String(t || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
 function quality(s) {
  const flags = [];
  if (!s.peer && s.type === 'journal') flags.push('Not marked peer reviewed');
  const y = parseInt(s.year, 10);
  if (!y) flags.push('No date');
  else if (new Date().getFullYear() - y > 7) flags.push('Older than 7 years: fine for theory, check for current IT practice');
  if (!s.authors.trim()) flags.push('No author: check authority');
  if (s.type === 'web' && !s.peer) flags.push('Web source: corroborate with a scholarly or primary source');
  if (/[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/.test(s.title) && s.type === 'journal') flags.push('Title may be in title case: APA uses sentence case for article titles');
  return flags;
 }
 function renderSources() {
  const list = $('#tk-src-list'); list.replaceChildren();
  const filter = $('#tk-src-filter').value;
  const shown = sources.filter(s => !filter || s.course === filter).sort((a, b) => fmtAuthors(a.authors || a.title).localeCompare(fmtAuthors(b.authors || b.title)));
  $('#tk-src-empty').hidden = shown.length > 0;
  shown.forEach(s => {
   const ref = el('p', {className: 'tk-ref'}); ref.innerHTML = apa(s);
   const st = el('small', {className: 'tk-note'});
   const flags = quality(s);
   list.append(el('li', {className: 'tk-src'}, ref,
    el('div', {className: 'tk-src-meta'}, el('code', {textContent: inText(s)}), s.course ? el('span', {className: 'pill', textContent: s.course}) : '', s.peer ? el('span', {className: 'pill tk-ok', textContent: 'Peer reviewed'}) : ''),
    s.notes ? el('p', {className: 'tk-src-notes', textContent: s.notes}) : '',
    flags.length ? el('ul', {className: 'tk-flags'}, flags.map(f => el('li', {textContent: f}))) : '',
    el('div', {className: 'resource-buttons'},
     el('button', {type: 'button', textContent: 'Copy reference', onclick: () => copy(ref.textContent, st)}),
     el('button', {type: 'button', textContent: 'Copy in-text', onclick: () => copy(inText(s), st)}),
     el('button', {type: 'button', textContent: 'Delete', onclick: () => { if (st.dataset.confirm) { sources = sources.filter(x => x !== s); save('sources', sources); renderSources(); } else { st.dataset.confirm = 1; st.textContent = 'Click Delete again to remove this source.'; } }}),
     st)));
  });
 }
 const srcType = $('#tk-src-type');
 const containerLabel = {journal: 'Journal name', book: 'Publisher', report: 'Publisher or organization', web: 'Site name'};
 srcType.onchange = () => { $('#tk-src-container-label').textContent = containerLabel[srcType.value]; document.querySelectorAll('.tk-journal-only').forEach(n => n.hidden = srcType.value !== 'journal'); };
 srcType.onchange();
 sf.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(sf));
  d.peer = !!d.peer; d.id = Date.now();
  if (!d.title.trim()) return;
  sources.push(d); save('sources', sources); sf.reset(); srcType.onchange(); renderSources();
  $('#tk-src-status').textContent = 'Source saved.';
 });
 $('#tk-src-filter').append(el('option', {value: '', textContent: 'All courses'}), ...courseOptions());
 $('#tk-src-filter').onchange = renderSources;
 $('#tk-src-export').onclick = () => {
  const tmp = el('div');
  const lines = sources.slice().sort((a, b) => fmtAuthors(a.authors || a.title).localeCompare(fmtAuthors(b.authors || b.title))).map(s => { tmp.innerHTML = apa(s); return tmp.textContent; });
  download('References.txt', 'References\n\n' + lines.join('\n\n') + '\n', 'text/plain;charset=utf-8');
 };
 renderSources();

 /* ---------- 3. Draft rigor check ---------- */
 const ABSOLUTES = ['always','never','proves','proven','undeniably','obviously','clearly','everyone','no one','all experts','guarantees','certainly','definitely','unquestionably'];
 const FILLER = ['very','really','basically','actually','just','a lot','kind of','sort of','in order to','due to the fact that','it is important to note'];
 const syllables = w => { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); return Math.max(1, (w.match(/[aeiouy]{1,2}/g) || []).length); };
 $('#tk-draft-run').onclick = () => {
  const text = $('#tk-draft').value.trim();
  save('draft', text);
  const out = $('#tk-draft-out'); out.replaceChildren();
  if (!text) { out.append(el('p', {className: 'tk-note', textContent: 'Paste a draft first.'})); return; }
  const words = text.match(/\b[\w'’-]+\b/g) || [];
  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 2);
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const citeRe = /\(([A-Z][\w'’-]+(?: et al\.)?(?:,? (?:&|and) [A-Z][\w'’-]+)?),? (\d{4}|n\.d\.)[a-z]?(?:, p+\. ?\d+)?\)|[A-Z][\w'’-]+(?: et al\.)? \((\d{4}|n\.d\.)\)/g;
  const cites = text.match(citeRe) || [];
  const uncited = paras.filter((p, i) => p.split(/\s+/).length > 40 && !p.match(citeRe) && i !== 0 && i !== paras.length - 1);
  const lower = ' ' + text.toLowerCase() + ' ';
  const count = list => list.map(w => [w, (lower.match(new RegExp('\\b' + w.replace(/ /g, '\\s+') + '\\b', 'g')) || []).length]).filter(x => x[1]);
  const abs = count(ABSOLUTES), fill = count(FILLER);
  const firstPerson = (lower.match(/\b(i|me|my|mine)\b/g) || []).length;
  const passive = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const grade = sentences.length ? (0.39 * words.length / sentences.length + 11.8 * syl / words.length - 15.59) : 0;
  const longS = sentences.filter(s => s.split(/\s+/).length > 35).length;
  const named = new Set(cites.map(c => c.replace(/[()]/g, '').replace(/,? (\d{4}|n\.d\.).*/, '').trim()));
  const logged = new Set(sources.map(s => (s.authors.split(';')[0] || '').split(',')[0].trim()).filter(Boolean));
  const missing = [...named].map(n => n.split(/ et al\.| & | and /)[0].trim()).filter(n => logged.size && !logged.has(n));
  const row = (label, value, verdict, tip) => el('tr', {className: verdict}, el('th', {textContent: label}), el('td', {textContent: value}), el('td', {textContent: tip}));
  out.append(el('table', {className: 'tk-report'},
   el('tbody', {},
    row('Length', words.length + ' words · ' + paras.length + ' paragraphs', '', 'Compare with the assignment word range.'),
    row('Citations', cites.length + ' in-text citations', cites.length ? 'ok' : 'bad', cites.length ? 'Check that each one appears in your reference list.' : 'No APA in-text citations found. Graduate work needs sourced claims.'),
    row('Uncited body paragraphs', uncited.length + '', uncited.length ? 'warn' : 'ok', uncited.length ? 'These body paragraphs make claims with no citation. Add a source or label them as your own analysis or experience.' : 'Every substantial body paragraph has at least one citation.'),
    row('Cited but not in source log', missing.length ? missing.join(', ') : 'None', missing.length ? 'warn' : 'ok', logged.size ? 'Add these to Sources so your reference list is complete.' : 'Log sources in the Sources tab to enable this check.'),
    row('Absolute claims', abs.length ? abs.map(([w, n]) => w + ' ×' + n).join(', ') : 'None', abs.length ? 'warn' : 'ok', 'Overclaiming weakens academic arguments. Qualify these or support them with evidence.'),
    row('Filler phrases', fill.length ? fill.map(([w, n]) => w + ' ×' + n).join(', ') : 'None', fill.length > 3 ? 'warn' : 'ok', 'Cut these to make the writing tighter.'),
    row('First person', firstPerson + ' uses', firstPerson > 8 ? 'warn' : '', 'APA allows first person. Check the assignment: reflections welcome it, analytical papers usually use less.'),
    row('Possible passive voice', passive + '', passive > sentences.length / 4 ? 'warn' : '', 'Prefer active voice when the actor matters.'),
    row('Long sentences (35+ words)', longS + '', longS ? 'warn' : 'ok', 'Split long sentences for clarity.'),
    row('Reading grade (Flesch-Kincaid)', grade.toFixed(1), grade > 18 ? 'warn' : 'ok', 'Graduate writing is often around 13 to 17. Higher usually means dense sentences, not deeper thinking.')
   )));
  if (uncited.length) out.append(el('details', {className: 'tk-uncited'}, el('summary', {textContent: 'Show uncited paragraphs'}), uncited.map(p => el('blockquote', {textContent: p.slice(0, 280) + (p.length > 280 ? '…' : '')}))));
 };
 $('#tk-draft').value = load('draft', '');
 const checklist = ['Directly answers every part of the prompt','Thesis or purpose stated in the introduction','Each claim is supported by a source, data, or a clearly labeled professional example','Connects to the specific competency wording being assessed','Considers a counterpoint, trade-off, or risk','Applies the idea to a real organization or scenario','APA 7 formatting: title page, headings, in-text citations, reference list','Proofread aloud; AI assistance disclosed if the course requires it'];
 const checks = load('checks', {});
 $('#tk-checklist').append(...checklist.map((c, i) => { const cb = el('input', {type: 'checkbox', checked: !!checks[i]}); cb.onchange = () => { checks[i] = cb.checked; save('checks', checks); }; return el('label', {className: 'tk-check'}, cb, ' ' + c); }));
 $('#tk-checks-reset').onclick = () => { Object.keys(checks).forEach(k => delete checks[k]); save('checks', checks); document.querySelectorAll('#tk-checklist input').forEach(c => c.checked = false); };

 /* ---------- 4. AI-use log ---------- */
 let ailog = load('ailog', []);
 const af = $('#tk-ai-form');
 $('#tk-ai-course').append(...courseOptions());
 af.date.value = today();
 const disclosure = e => `I used ${e.tool} on ${e.date} to ${e.purpose.replace(/\.$/, '')}. ${e.kept ? 'I ' + e.kept.replace(/^i /i, '').replace(/\.$/, '') + '. ' : ''}All analysis, final wording, and conclusions are my own, and I verified any facts against cited sources.`;
 function renderAI() {
  const list = $('#tk-ai-list'); list.replaceChildren();
  $('#tk-ai-empty').hidden = ailog.length > 0;
  ailog.slice().reverse().forEach(e => {
   const st = el('small', {className: 'tk-note'});
   list.append(el('li', {className: 'tk-src'},
    el('div', {className: 'tk-src-meta'}, el('b', {textContent: e.date}), el('span', {className: 'pill', textContent: e.course}), el('span', {textContent: e.tool + (e.assignment ? ' · ' + e.assignment : '')})),
    el('p', {className: 'tk-src-notes', textContent: disclosure(e)}),
    el('div', {className: 'resource-buttons'},
     el('button', {type: 'button', textContent: 'Copy disclosure', onclick: () => copy(disclosure(e), st)}),
     el('button', {type: 'button', textContent: 'Delete', onclick: () => { ailog = ailog.filter(x => x !== e); save('ailog', ailog); renderAI(); }}), st)));
  });
 }
 af.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(af)); d.id = Date.now();
  ailog.push(d); save('ailog', ailog); af.reset(); af.date.value = today(); renderAI();
 });
 $('#tk-ai-export').onclick = () => download('AI-use-log.md', '# AI use log\n\n' + ailog.map(e => `## ${e.date} · ${e.course}${e.assignment ? ' · ' + e.assignment : ''}\n\n- Tool: ${e.tool}\n- Purpose: ${e.purpose}\n- What I kept or changed: ${e.kept || '(not recorded)'}\n\n> ${disclosure(e)}`).join('\n\n') + '\n', 'text/markdown;charset=utf-8');
 renderAI();

 /* ---------- 5. Flashcards (Leitner boxes) ---------- */
 let cards = load('cards', []);
 const INTERVALS = [0, 1, 3, 7, 14, 30]; // days per box
 $('#tk-fc-course').append(...courseOptions());
 $('#tk-fc-filter').append(el('option', {value: '', textContent: 'All courses'}), ...courseOptions());
 let current = null;
 const due = () => { const f = $('#tk-fc-filter').value; const now = Date.now(); return cards.filter(c => (!f || c.course === f) && c.due <= now); };
 function nextCard() {
  const d = due();
  $('#tk-fc-stats').textContent = d.length + ' due now · ' + cards.length + ' cards total · ' + cards.filter(c => c.box >= 4).length + ' well known';
  const front = $('#tk-fc-front'), back = $('#tk-fc-back');
  $('#tk-fc-grade').hidden = true; back.hidden = true; $('#tk-fc-show').hidden = !d.length;
  if (!d.length) { current = null; front.textContent = cards.length ? 'Nothing due. Come back later, or add more cards.' : 'Add your first card below. Use your own words, and keep one idea per card.'; return; }
  current = d.sort((a, b) => a.box - b.box || a.due - b.due)[0];
  front.textContent = current.q; back.textContent = current.a;
 }
 $('#tk-fc-show').onclick = () => { $('#tk-fc-back').hidden = false; $('#tk-fc-show').hidden = true; $('#tk-fc-grade').hidden = false; };
 document.querySelectorAll('#tk-fc-grade button').forEach(b => b.onclick = () => {
  if (!current) return;
  const g = b.dataset.g;
  current.box = g === 'again' ? 0 : g === 'hard' ? Math.max(1, current.box) : Math.min(5, current.box + 1);
  current.due = Date.now() + INTERVALS[current.box] * 864e5 + (g === 'again' ? 60e3 : 0);
  save('cards', cards); nextCard();
 });
 $('#tk-fc-filter').onchange = nextCard;
 $('#tk-fc-form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, q = f.q.value.trim(), a = f.a.value.trim();
  if (!q || !a) return;
  cards.push({id: Date.now(), course: f.course.value, q, a, box: 0, due: Date.now()});
  save('cards', cards); f.q.value = ''; f.a.value = ''; f.q.focus(); nextCard();
 });
 nextCard();

 /* ---------- Backup / restore ---------- */
 $('#tk-backup').onclick = () => {
  const data = {version: 1, exported: new Date().toISOString(), competencies: comp, sources, ailog, cards, checks, draft: load('draft', '')};
  download('MIS-toolkit-backup-' + today() + '.json', JSON.stringify(data, null, 1), 'application/json');
 };
 $('#tk-restore').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
   const d = JSON.parse(await f.text());
   if (d.version !== 1) throw new Error();
   ['competencies','sources','ailog','cards','checks','draft'].forEach(k => d[k] !== undefined && save(k, d[k]));
   $('#tk-backup-status').textContent = 'Restored. Reloading…'; setTimeout(() => location.reload(), 600);
  } catch { $('#tk-backup-status').textContent = 'That file is not a toolkit backup.'; }
 };
})();
