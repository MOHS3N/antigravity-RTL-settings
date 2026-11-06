# Google Antigravity: RTL & Vazirmatn Persian Font Setup Guide

A complete, production-grade guide to enabling **Right-to-Left (RTL)** chat alignment and the **Vazirmatn (وزیر متن)** Persian/Arabic typography in **Google Antigravity 2.0**, while preserving English font fidelity and keeping code blocks and system UI cards strictly Left-to-Right (LTR).

---

## Table of Contents

- [Overview & Features](#overview--features)
- [Prerequisites](#prerequisites)
- [Quick Start (Automated Script)](#quick-start-automated-script)
- [How to Revert to Original Settings](#how-to-revert-to-original-settings)
- [Technical Architecture (How It Works)](#technical-architecture-how-it-works)
- [Manual Step-by-Step Installation](#manual-step-by-step-installation)
  - [Step 1: Backup `app.asar`](#step-1-backup-appasar)
  - [Step 2: Extract `app.asar`](#step-2-extract-appasar)
  - [Step 3: Patch `dist/preload.js`](#step-3-patch-distpreloadjs)
  - [Step 4: Repack `app.asar`](#step-4-repack-appasar)
  - [Step 5: Replace Original `app.asar`](#step-5-replace-original-appasar)
- [CSS Rules Breakdown](#css-rules-breakdown)
- [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview & Features

By default, Google Antigravity is configured for Left-to-Right (LTR) languages using the Google Sans font family. When conversing in Persian, Arabic, or bilingual text, paragraphs align to the left and Persian glyphs fall back to default system fonts.

This guide provides a seamless patch that:

1. **RTL Chat Alignment:**
   - User chat bubbles (`.agy-user-bubble`, `[data-testid="user-input-step"]`).
   - Assistant responses: Markdown headings (`h1`-`h6`), paragraphs, blockquotes, lists, and tables.
   - Chat input composer (`textarea`, `[contenteditable="true"]`, `[data-testid="chat-input"]`).
2. **Hybrid Typography (Vazirmatn + Google Sans):**
   - Injects the modern **Vazirmatn (Variable font weight 100-900)**.
   - Utilizes CSS `@font-face` with `unicode-range: U+0600-06FF, ...` so that **only Persian and Arabic characters** render in Vazirmatn.
   - English words, numbers, and Latin characters seamlessly remain in **Google Sans Flex**.
   - Embeds the font as a base64 WOFF2 payload (~60 KB), operating **100% offline** with zero network dependency or font-swap latency.
3. **Strict LTR Preservation for Code & System UI:**
   - **Code blocks & terminals:** `pre`, `code`, `.monaco-editor`, `.xterm`, and `[data-testid="terminal"]` remain LTR with monospace fonts.
   - **System Review Cards:** The "Files Changed" summary bar (`files-changed-header`) and `Review` buttons remain in natural LTR order (e.g., `6 files changed +436 -0` is not scrambled).
   - **System Banners & Feedback:** Feedback banners (e.g., `Thanks for your feedback!`), tool-call collapsible accordions, badges, and action buttons retain LTR layout and correct punctuation placement.

---

## Prerequisites

1. **Operating System:** Windows 10/11 (or macOS / Linux with adjusted paths).
2. **Node.js:** Node.js v18 or newer installed (includes `npx`).
3. **Google Antigravity:** Installed on your machine.
   - Default Windows installation path:  
     `%LOCALAPPDATA%\Programs\antigravity\resources\app.asar`  
     (`C:\Users\<YourUsername>\AppData\Local\Programs\antigravity\resources\app.asar`)

---

## Quick Start (Automated Script)

If you are using the repository or folder with the included utility scripts, follow these steps:

1. **Close Google Antigravity** completely (ensure `Antigravity.exe` is not running in Task Manager).
2. Run the patch:
   - **Option A (Batch file):** Double-click `apply-patch.bat`.
   - **Option B (Node command):** Open a terminal in this directory and execute:
     ```bash
     node apply-patch.js
     ```
3. The script will automatically:
   - Create a clean backup at `app.asar.original` (if not already present).
   - Extract the Electron archive.
   - Embed the base64 Vazirmatn font and custom CSS rules into `dist/preload.js`.
   - Repack the archive preserving unpacked binaries (`node_modules/chrome-devtools-mcp`).
   - Replace `app.asar` in your Antigravity installation folder.
4. **Launch Google Antigravity.** All chats are now right-aligned with Vazirmatn Persian typography!

---

## How to Revert to Original Settings

If you ever want to uninstall the customizations and revert Antigravity back to its factory default state:

### Automated Revert:
1. Close Google Antigravity.
2. Double-click `restore-original.bat`, or run in your terminal:
   ```bash
   node restore-original.js
   ```

### Manual Revert:
1. Close Google Antigravity.
2. Navigate to:
   ```text
   C:\Users\<YourUsername>\AppData\Local\Programs\antigravity\resources\
   ```
3. Delete the patched `app.asar`.
4. Copy/rename `app.asar.original` back to `app.asar`.
5. Start Antigravity. The app is completely restored to factory default.

---

## Technical Architecture (How It Works)

Antigravity 2.0 is built on Electron. Its front-end assets and preload scripts are packaged inside an archive file called `app.asar`.

```
antigravity/
└── resources/
    ├── app.asar               <-- Electron package containing web app & preload scripts
    ├── app.asar.original      <-- Untouched original backup
    └── app.asar.unpacked/     <-- Extracted native binary modules (e.g. chrome-devtools-mcp)
```

Inside `app.asar`, `dist/preload.js` runs in every renderer window before any webpage script loads, with DOM access. By appending a self-invoking style injector into `dist/preload.js`:
- The styles are injected immediately upon window initialization (`DOMContentLoaded` and `load`).
- A `MutationObserver` watches `document.documentElement` to re-inject the styles if Antigravity's client-side SPA router flushes or modifies `<head>`.
- The base64 WOFF2 font payload is loaded into memory directly from local disk, meaning no Google Fonts CDN requests are made.

---

## Manual Step-by-Step Installation

If you prefer doing this manually or need to adapt it for a different platform:

### Step 1: Backup `app.asar`
Open PowerShell / Command Prompt and create a backup of your current `app.asar`:
```powershell
$res = "$env:LOCALAPPDATA\Programs\antigravity\resources"
Copy-Item "$res\app.asar" "$res\app.asar.original"
```

### Step 2: Extract `app.asar`
Ensure the companion unpacked folder exists if extracting from a backup:
```powershell
if (Test-Path "$res\app.asar.unpacked") {
    Copy-Item "$res\app.asar.unpacked" "$res\app.asar.original.unpacked" -Recurse -Force
}
npx @electron/asar extract "$res\app.asar.original" ".\temp_unpacked"
```

### Step 3: Patch `dist/preload.js`
Open `.\temp_unpacked\dist\preload.js` in your editor and append the injection code at the bottom of the file:

```javascript
function installAntigravityRtlAndVazirmatn() {
    const g = globalThis;
    if (!g.document) return;

    const STYLE_ID = 'antigravity-custom-chat-rtl-vazir';
    const customCss = `
@font-face {
  font-family: 'VazirmatnArabic';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: local('Vazirmatn'), local('Vazirmatn Regular'), url('data:font/woff2;base64,<BASE64_WOFF2_FONT_STRING_HERE>') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
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
`;

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
```

*(Note: Replace `<BASE64_WOFF2_FONT_STRING_HERE>` with the contents of `vazir_base64.txt`)*

### Step 4: Repack `app.asar`
Repack the folder into an asar archive. **Critical:** You must pass `--unpack-dir "node_modules/chrome-devtools-mcp"` so that electron-builder's unpacked binaries are properly referenced:
```powershell
npx @electron/asar pack ".\temp_unpacked" ".\patched.asar" --unpack-dir "node_modules/chrome-devtools-mcp"
```

### Step 5: Replace Original `app.asar`
Copy the newly built archive over the active Antigravity package:
```powershell
Copy-Item ".\patched.asar" "$res\app.asar" -Force
Remove-Item ".\temp_unpacked" -Recurse -Force
Remove-Item ".\patched.asar" -Force
```

---

## CSS Rules Breakdown

| Scope | Selectors | Direction | Font Family |
| :--- | :--- | :--- | :--- |
| **User Messages** | `.agy-user-bubble`, `[data-testid="user-input-step"]` | `RTL` (Right-to-Left) | `VazirmatnArabic` (Fallback: `Google Sans Flex`) |
| **Chat Composer** | `[data-testid="chat-input"]`, `[contenteditable="true"]`, `textarea` | `RTL` (Right-to-Left) | `VazirmatnArabic` (Fallback: `Google Sans Flex`) |
| **Assistant Markdown** | `[data-testid="planner-response-text"]`, `[data-markdown-root]` (p, headings, li, blockquote, table) | `RTL` (Right-to-Left) | `VazirmatnArabic` (Fallback: `Google Sans Flex`) |
| **Code & Terminals** | `pre`, `code`, `.xterm`, `[data-testid="terminal"]`, `.monaco-editor` | `LTR` (Left-to-Right) | `Google Sans Code`, monospace |
| **Files Changed Card** | `.files-changed-header`, `[data-testid*="changed-files"]`, `.review-button` | `LTR` (Left-to-Right) | Unchanged (Default UI) |
| **System Toolbars & Feedback** | `[data-testid="cascade-system-message-toolbar"]`, `[role="alert"]`, `[role="status"]` | `LTR` (Left-to-Right) | Unchanged (Default UI) |
| **Tool Execution Steps** | `[data-testid*="tool"]`, `[data-testid*="step"]:not([data-testid="user-input-step"])` | `LTR` (Left-to-Right) | Unchanged (Default UI) |

---

## Troubleshooting & FAQ

### 1. `EBUSY: resource busy or locked` when applying patch
**Cause:** Google Antigravity is currently open and holding a lock on `app.asar`.  
**Solution:** Close Antigravity completely via the system tray or Task Manager, then run `apply-patch.bat` again.

### 2. What happens after an official Antigravity software update?
When Google Antigravity updates to a new version, Electron will replace `app.asar` with the new version.  
**Solution:** Simply double-click `apply-patch.bat` again. It will automatically detect the new version, back it up, and re-apply your RTL and Vazirmatn customizations.

### 3. Can I use a different Persian font instead of Vazirmatn?
**Yes.** To use another font (e.g. Shabnam, Sahel, IRANSans):
1. Convert your `.ttf` or `.otf` font file to `.woff2`.
2. Convert the `.woff2` file to a Base64 string.
3. Replace the content of `vazir_base64.txt` with your new Base64 string.
4. Run `apply-patch.bat`.

---

## License & Credits

- **Vazirmatn Font:** Created by [Saber Rastikerdar](https://github.com/rastikerdar/vazirmatn), licensed under the [SIL Open Font License](https://scripts.sil.org/OFL).
- **Google Antigravity:** Developed by Google DeepMind. Customization designed for enhanced accessibility and bilingual Persian/English workflows.
