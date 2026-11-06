const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASAR_PATH = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\mohse\\AppData\\Local',
  'Programs',
  'antigravity',
  'resources',
  'app.asar'
);

const BACKUP_PATH = ASAR_PATH + '.original';
const WORK_DIR = path.join(__dirname, '.tmp_patch');

if (!fs.existsSync(ASAR_PATH)) {
  console.error('Error: app.asar not found at specified path.');
  process.exit(1);
}

const unpackedCompanion = path.join(path.dirname(ASAR_PATH), 'app.asar.unpacked');
const backupUnpacked = BACKUP_PATH + '.unpacked';

if (!fs.existsSync(BACKUP_PATH)) {
  fs.copyFileSync(ASAR_PATH, BACKUP_PATH);
  if (fs.existsSync(unpackedCompanion) && !fs.existsSync(backupUnpacked)) {
    fs.cpSync(unpackedCompanion, backupUnpacked, { recursive: true });
  }
} else {
  if (fs.existsSync(unpackedCompanion) && !fs.existsSync(backupUnpacked)) {
    fs.cpSync(unpackedCompanion, backupUnpacked, { recursive: true });
  }
}

if (fs.existsSync(WORK_DIR)) {
  fs.rmSync(WORK_DIR, { recursive: true, force: true });
}
fs.mkdirSync(WORK_DIR, { recursive: true });

try {
  execSync(`npx @electron/asar extract "${BACKUP_PATH}" "${WORK_DIR}"`, { stdio: 'inherit' });

  const preloadPath = path.join(WORK_DIR, 'dist', 'preload.js');
  if (!fs.existsSync(preloadPath)) {
    throw new Error('dist/preload.js not found.');
  }

  const fontB64Path = path.join(__dirname, 'vazir_base64.txt');
  let b64 = '';
  if (fs.existsSync(fontB64Path)) {
    b64 = fs.readFileSync(fontB64Path, 'utf8').trim();
  } else {
    const scratchB64 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', 'a63097fe-5552-4556-8489-3a0d5db55611', 'scratch', 'vazir_base64.txt');
    if (fs.existsSync(scratchB64)) {
      b64 = fs.readFileSync(scratchB64, 'utf8').trim();
      fs.writeFileSync(fontB64Path, b64);
    }
  }

  let preloadContent = fs.readFileSync(preloadPath, 'utf8');

  const legacyMarker = '// --- Antigravity RTL & Vazirmatn Font Customization ---';
  if (preloadContent.includes(legacyMarker)) {
    preloadContent = preloadContent.substring(0, preloadContent.indexOf(legacyMarker));
  }
  const marker = '/* antigravity-rtl-vazirmatn */';
  if (preloadContent.includes(marker)) {
    preloadContent = preloadContent.substring(0, preloadContent.indexOf(marker));
  }

  const patchCode = `
${marker}
function installAntigravityRtlAndVazirmatn() {
    const g = globalThis;
    if (!g.document) return;

    const STYLE_ID = 'antigravity-custom-chat-rtl-vazir';
    const customCss = \`
@font-face {
  font-family: 'VazirmatnArabic';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: local('Vazirmatn'), local('Vazirmatn Regular'), url('data:font/woff2;base64,${b64}') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1;
}

.agy-user-bubble,
.agy-user-bubble-frame,
[data-testid="user-input-step"],
[data-testid="user-input-step"] p {
  direction: rtl !important;
  text-align: right !important;
  font-family: 'VazirmatnArabic', "Google Sans Flex", "Google Sans", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  line-height: 1.7 !important;
}

[contenteditable="true"][class*="cursor-text"],
[data-testid="chat-input"],
.ProseMirror,
textarea {
  direction: rtl !important;
  text-align: right !important;
  font-family: 'VazirmatnArabic', "Google Sans Flex", "Google Sans", "Inter", system-ui, sans-serif !important;
  line-height: 1.6 !important;
}

[data-testid="planner-response-text"],
[data-markdown-root],
[data-testid="planner-response-text"] p,
[data-markdown-root] p,
.prose p,
.markdown p {
  direction: rtl !important;
  text-align: right !important;
  font-family: 'VazirmatnArabic', "Google Sans Flex", "Google Sans", "Inter", system-ui, sans-serif !important;
  line-height: 1.7 !important;
}

[data-testid="planner-response-text"] h1, [data-testid="planner-response-text"] h2,
[data-testid="planner-response-text"] h3, [data-testid="planner-response-text"] h4,
[data-testid="planner-response-text"] h5, [data-testid="planner-response-text"] h6,
[data-markdown-root] h1, [data-markdown-root] h2,
[data-markdown-root] h3, [data-markdown-root] h4,
[data-markdown-root] h5, [data-markdown-root] h6 {
  direction: rtl !important;
  text-align: right !important;
  font-family: 'VazirmatnArabic', "Google Sans Flex", "Google Sans", "Inter", system-ui, sans-serif !important;
}

[data-testid="planner-response-text"] ul, [data-markdown-root] ul,
[data-testid="planner-response-text"] ol, [data-markdown-root] ol {
  direction: rtl !important;
  text-align: right !important;
  padding-right: 1.5rem !important;
  padding-left: 0 !important;
}

[data-testid="planner-response-text"] li, [data-markdown-root] li {
  direction: rtl !important;
  text-align: right !important;
  font-family: 'VazirmatnArabic', "Google Sans Flex", "Google Sans", "Inter", system-ui, sans-serif !important;
}

[data-testid="planner-response-text"] blockquote, [data-markdown-root] blockquote {
  direction: rtl !important;
  text-align: right !important;
  border-right: 3px solid currentColor !important;
  border-left: none !important;
  padding-right: 1rem !important;
  padding-left: 0 !important;
  margin-right: 0 !important;
  opacity: 0.9;
}

[data-testid="planner-response-text"] table, [data-markdown-root] table {
  direction: rtl !important;
  text-align: right !important;
}

[data-testid="planner-response-text"] th, [data-testid="planner-response-text"] td,
[data-markdown-root] th, [data-markdown-root] td {
  text-align: right !important;
}

pre, code, kbd, samp,
pre code,
.prose pre, .markdown pre,
[class*="code-block"],
[class*="syntax-highlighter"],
.monaco-editor,
[data-testid="terminal"],
.xterm {
  direction: ltr !important;
  text-align: left !important;
  font-family: "Google Sans Code", "Cascadia Code", Consolas, monospace !important;
}

:not(pre) > code {
  direction: ltr !important;
  display: inline-block !important;
  unicode-bidi: embed !important;
  padding: 0.15em 0.35em !important;
  font-family: "Google Sans Code", monospace !important;
}

[data-testid="turn-cards-container"],
[data-testid*="changed-files"],
.files-changed-header,
[class*="files-changed"],
.review-button,
button.review-button,
[data-testid="cascade-system-message-toolbar"],
[data-testid*="tool"],
[data-testid*="step"]:not([data-testid="user-input-step"]),
button,
.agy-button,
[role="status"],
[role="alert"],
[class*="feedback"],
[data-testid*="feedback"],
span[data-screenshot-volatile="true"],
.border:has(.files-changed-header) {
  direction: ltr !important;
  text-align: left !important;
}
\`;

    const inject = () => {
        const root = g.document?.head || g.document?.documentElement;
        if (!root) return;
        let el = g.document.getElementById(STYLE_ID);
        if (!el) {
            el = g.document.createElement('style');
            el.id = STYLE_ID;
            el.textContent = customCss;
            root.appendChild(el);
        } else if (el.textContent !== customCss) {
            el.textContent = customCss;
        }
    };

    inject();
    g.document.addEventListener?.('DOMContentLoaded', inject);
    g.addEventListener?.('load', inject);

    if (typeof g.MutationObserver === 'function') {
        const obs = new g.MutationObserver(() => {
            if (!g.document.getElementById(STYLE_ID)) {
                inject();
            }
        });
        obs.observe(g.document.documentElement, { childList: true, subtree: true });
    }
}
installAntigravityRtlAndVazirmatn();
`;

  fs.writeFileSync(preloadPath, preloadContent + patchCode);

  const targetAsar = path.join(WORK_DIR, 'patched.asar');
  execSync(`npx @electron/asar pack "${WORK_DIR}" "${targetAsar}" --unpack-dir "node_modules/chrome-devtools-mcp"`, { stdio: 'inherit' });

  fs.copyFileSync(targetAsar, ASAR_PATH);
  console.log('Patch successfully applied.');
} finally {
  try {
    fs.rmSync(WORK_DIR, { recursive: true, force: true });
  } catch (e) {}
}
