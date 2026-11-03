STUDENT RESEARCH PORTAL — EXPANDED EDITION (v5)
Prepared 3 November 2026

DEPLOY
1. Extract this ZIP into a folder.
2. Upload the contents so index.html is at the web root (or chosen subdirectory).
3. Keep styles.css, enhancements.css, portal.js, HTML files, and the TSV together.
4. The copilot/ folder is a synchronized compatibility copy of the full portal.
5. Open index.html. Navigation uses relative URLs and supports subdirectory hosting.

No build step or backend is required. HTTPS is recommended for clipboard support.
Opening index.html directly from disk also works; copy buttons fall back to text
selection if clipboard access is unavailable. Reading and navigation work without
JavaScript. Search, filtering, calculator, and automatic contents use JavaScript.

See review-notes.html for editorial findings, scope, and source limitations.
See VALIDATION.txt for checks. Original sections and external links are retained.
The original ZIP itself is not embedded in this deployment package.
No API credentials, paid calls, analytics, remote fonts, or tracking were added.

MAINTENANCE
Update provider catalogs and review dates as models change. Edit root files and
copy matching files to copilot/ to keep both deployment paths synchronized.
