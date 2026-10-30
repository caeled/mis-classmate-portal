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

// --- AI Lab Tab Activation & Logic ---
document.addEventListener("DOMContentLoaded", () => {
  const promptBtn = document.getElementById("btn-generate-ai-prompt");
  const copyBtn = document.getElementById("btn-copy-prompt");
  const promptOutput = document.getElementById("ai-prompt-output");
  const logGeminiBtn = document.getElementById("btn-log-gemini-use");

  // The prompt form is a generator, not a submission: never reload the page.
  document.getElementById("ai-prompt-form")?.addEventListener("submit", e => e.preventDefault());

  if (promptBtn) {
    promptBtn.addEventListener("click", () => {
      const topic = document.getElementById("ai-prompt-topic").value;
      const mode = document.getElementById("ai-prompt-mode").value;
      const concept = document.getElementById("ai-prompt-concept").value.trim() || "operational infrastructure design";

      let promptText = "";

      if (mode === "academic_rubric") {
        promptText = `You are an academic assessor for a graduate Master of Information Systems (MIS) competency exam.\n\n` +
          `Domain: ${topic}\n` +
          `Subject Under Evaluation: "${concept}"\n\n` +
          `Please evaluate my proposed artifact claims against graduate rigor standards:\n` +
          `1. Challenge my technical assumptions and identify edge cases or trade-offs I may have overlooked.\n` +
          `2. What authoritative frameworks (e.g., TOGAF, NIST, COBIT, ITIL) should I reference to formalize this practical experience?\n` +
          `3. Ask me 3 challenging Socratic questions assessing graduate-level comprehension.`;
      } else if (mode === "literature_search") {
        promptText = `Generate advanced Boolean search strings for Google Scholar, IEEE Xplore, and ACM Digital Library focusing on:\n` +
          `Topic: ${topic} - specifically regarding "${concept}".\n` +
          `Include peer-reviewed search terms covering: operational impact, enterprise governance, risk mitigation, and empirical case studies from the last 5 years.`;
      } else if (mode === "gap_analysis") {
        promptText = `I have 30 years of direct hands-on operational IT experience. I want to translate my practical knowledge of "${concept}" into formal graduate academic terminology.\n\n` +
          `Help me map practical "field" concepts to their formal MIS academic paradigms, theoretical models, and standard business capability language.`;
      }

      promptOutput.value = promptText;
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (!promptOutput.value) return;
      navigator.clipboard.writeText(promptOutput.value).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy to Clipboard"), 1800);
      });
    });
  }

  // Auto-fill an entry in the AI-use log for Gemini
  if (logGeminiBtn) {
    logGeminiBtn.addEventListener("click", () => {
      const aiTab = document.getElementById("tk-tab-ai");
      if (aiTab) aiTab.click(); // Switch to AI log tab

      const toolInput = document.querySelector('#tk-ai input[name="tool"]') || document.querySelector('#tk-ai [name*="tool"]');
      const purposeInput = document.querySelector('#tk-ai textarea[name="purpose"]') || document.querySelector('#tk-ai [name*="purpose"]');

      if (toolInput) toolInput.value = "Google DeepMind / Gemini";
      if (purposeInput) purposeInput.value = "Used for literature synthesis, conceptual framework cross-referencing, and stress-testing architecture trade-offs.";

      alert("Pre-filled Gemini disclosure in your AI-use log!");
    });
  }

  // --- Terminal Quick-Launch Helper ---
  const terminalBtn = document.getElementById("btn-open-terminal");
  if (terminalBtn) {
    terminalBtn.addEventListener("click", () => {
      // 1. One-click script content that opens PowerShell in the directory
      const batContent =
        '@echo off\r\n' +
        'cd /d "%USERPROFILE%\\mis-research" 2>nul || cd /d "%HOME%\\mis-research"\r\n' +
        'start powershell.exe -NoExit -Command "Write-Host \'=== MIS Deep Research Workspace ===\' -ForegroundColor Cyan"\r\n';

      // 2. Generate and trigger download of the launcher file
      const blob = new Blob([batContent], { type: "application/x-bat" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "open-research.bat";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // 3. Fallback: Copy the direct command to the clipboard
      const fallbackCommand = 'cd ~/mis-research; powershell';
      navigator.clipboard.writeText(fallbackCommand);

      // 4. Visual feedback on the button
      const origText = terminalBtn.innerHTML;
      terminalBtn.textContent = "Downloaded & Copied!";
      setTimeout(() => {
        terminalBtn.innerHTML = origText;
      }, 2500);
    });
  }
});
