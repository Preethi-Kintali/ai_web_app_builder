// ============================================================
// CODE UTILITIES — Prompt2Page AI Platform
// ============================================================

// ──────────────────────────────────────────────
// Legacy: Parse single ```html ... ``` block
// ──────────────────────────────────────────────
export const parseGenerationResponse = (responseText) => {
  let code = '';
  let description = '';

  const htmlMarker = '```html';
  const startIndex = responseText.indexOf(htmlMarker);

  if (startIndex !== -1) {
    description = responseText.slice(0, startIndex).trim();
    const codeStart = startIndex + htmlMarker.length;
    const endIndex = responseText.indexOf('```', codeStart);
    code = endIndex !== -1
      ? responseText.slice(codeStart, endIndex).trim()
      : responseText.slice(codeStart).trim();
  } else {
    const genericMarker = '```';
    const genericStart = responseText.indexOf(genericMarker);
    if (genericStart !== -1) {
      description = responseText.slice(0, genericStart).trim();
      const codeStart = genericStart + genericMarker.length;
      const newlineIndex = responseText.indexOf('\n', codeStart);
      const actualCodeStart = newlineIndex !== -1 ? newlineIndex + 1 : codeStart;
      const endIndex = responseText.indexOf('```', actualCodeStart);
      code = endIndex !== -1
        ? responseText.slice(actualCodeStart, endIndex).trim()
        : responseText.slice(actualCodeStart).trim();
    } else {
      description = responseText.trim();
    }
  }

  return { code, description };
};

// ──────────────────────────────────────────────
// NEW: Parse multi-file response with filename markers
// Handles: ```html:index.html, ```css:styles.css, ```js:script.js
// Also handles: ```javascript:script.js
// ──────────────────────────────────────────────
export const parseMultiFileResponse = (responseText) => {
  const files = {};
  let description = '';

  // Regex: matches ```lang:filename or ```lang (without filename)
  const blockRegex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
  let firstBlockStart = Infinity;
  let match;

  const matches = [];
  while ((match = blockRegex.exec(responseText)) !== null) {
    matches.push({
      fullMatch: match[0],
      lang: match[1],         // e.g. 'html', 'css', 'js', 'javascript'
      filename: match[2]?.trim(), // e.g. 'index.html' or undefined
      content: match[3].trim(),
      index: match.index,
    });
    if (match.index < firstBlockStart) {
      firstBlockStart = match.index;
    }
  }

  // Extract description (text before first code block)
  if (firstBlockStart !== Infinity) {
    description = responseText.slice(0, firstBlockStart).trim();
  } else {
    description = responseText.trim();
  }

  // Map language to default filename
  const langToFile = {
    html: 'index.html',
    css: 'styles.css',
    js: 'script.js',
    javascript: 'script.js',
  };

  for (const m of matches) {
    const filename = m.filename || langToFile[m.lang.toLowerCase()] || `${m.lang}.txt`;
    // Normalize 'javascript' → use 'script.js' as key
    const normalizedFilename = filename === 'script.js' ? 'script.js' : filename;
    files[normalizedFilename] = m.content;
  }

  return { files, description };
};

// ──────────────────────────────────────────────
// Bundle multi-file project into a single HTML string
// for iframe srcDoc rendering (inline all CSS and JS)
// ──────────────────────────────────────────────
export const bundleFilesToHtml = (files) => {
  if (!files || typeof files !== 'object') return '';

  const entries = files instanceof Map
    ? Object.fromEntries(files)
    : files;

  let html = entries['index.html'] || '';
  const css = entries['styles.css'] || '';
  const js = entries['script.js'] || '';

  if (!html) return '';

  // Inject CSS inline: replace <link rel="stylesheet" href="styles.css">
  if (css) {
    if (html.includes('href="styles.css"') || html.includes("href='styles.css'")) {
      html = html.replace(
        /<link[^>]+href=['"]styles\.css['"][^>]*>/i,
        `<style>\n${css}\n</style>`
      );
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    }
  }

  // Inject JS inline: replace <script src="script.js">
  if (js) {
    if (html.includes('src="script.js"') || html.includes("src='script.js'")) {
      html = html.replace(
        /<script[^>]+src=['"]script\.js['"][^>]*><\/script>/i,
        `<script>\n${js}\n</script>`
      );
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    }
  }

  return html;
};

// ──────────────────────────────────────────────
// Parse enhanced fix response (structured errors + fixed files)
// ──────────────────────────────────────────────
export const parseFixResponse = (responseText) => {
  const errors = [];
  let fixedFiles = {};

  // Extract ERRORS_FOUND section
  const errorsMatch = responseText.match(/ERRORS_FOUND:\n([\s\S]*?)(?=FIXED_FILES:|```)/);
  if (errorsMatch) {
    const errorsText = errorsMatch[1].trim();
    if (!errorsText.toLowerCase().includes('no issues') && !errorsText.toLowerCase().includes('no errors')) {
      const lines = errorsText.split('\n').filter(l => l.trim());
      lines.forEach((line) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          errors.push({
            file: parts[0],
            line: parts[1] || 'unknown',
            severity: parts[2]?.toLowerCase() || 'info',
            description: parts[3] || parts.slice(2).join(' | '),
          });
        } else if (line.trim()) {
          errors.push({ file: 'general', line: 'unknown', severity: 'info', description: line.trim() });
        }
      });
    }
  }

  // Extract fixed files using multi-file parser
  const { files } = parseMultiFileResponse(responseText);
  fixedFiles = files;

  return { errors, fixedFiles };
};

// ──────────────────────────────────────────────
// Convert Map to plain object (for JSON serialization)
// ──────────────────────────────────────────────
export const mapToObject = (map) => {
  if (!map) return {};
  if (map instanceof Map) return Object.fromEntries(map);
  if (typeof map === 'object') return map;
  return {};
};
