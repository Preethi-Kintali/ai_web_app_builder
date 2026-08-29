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
  const changes = [];

  // 1. Extract CHANGES_MADE section
  const changesMatch = responseText.match(/CHANGES_MADE:([\s\S]*?)(?=```|$)/i);
  if (changesMatch) {
    const listText = changesMatch[1].trim();
    const listLines = listText.split('\n').filter(l => l.trim().startsWith('-'));
    listLines.forEach(l => changes.push(l.replace(/^- /, '').trim()));
  }

  // 2. Parse code blocks
  const blockRegex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
  let firstBlockStart = Infinity;
  let match;

  const matches = [];
  while ((match = blockRegex.exec(responseText)) !== null) {
    matches.push({
      fullMatch: match[0],
      lang: match[1],
      filename: match[2]?.trim(),
      content: match[3].trim(),
      index: match.index,
    });
    if (match.index < firstBlockStart) {
      firstBlockStart = match.index;
    }
  }

  // 3. Extract description (text before first code block, excluding CHANGES_MADE)
  if (firstBlockStart !== Infinity) {
    let fullHeader = responseText.slice(0, firstBlockStart).trim();
    description = fullHeader.replace(/CHANGES_MADE:[\s\S]*$/i, '').trim();
  } else {
    description = responseText.replace(/CHANGES_MADE:[\s\S]*$/i, '').trim();
  }

  // 4. Map language to default filename (Mapping logic stays same)
  const langToFile = {
    html: 'index.html',
    css: 'styles.css',
    js: 'script.js',
    javascript: 'script.js',
  };

  for (const m of matches) {
    const filename = m.filename || langToFile[m.lang.toLowerCase()] || `${m.lang}.txt`;
    files[filename] = m.content;
  }

  return { files, description, changes };
};

// ──────────────────────────────────────────────
// Bundle multi-file project into a single HTML string
// for iframe srcDoc rendering (inline all CSS and JS)
// ──────────────────────────────────────────────
export const bundleFilesToHtml = (files) => {
  if (!files || typeof files !== 'object') return '';

  let entries = files;
  if (files instanceof Map) {
    try {
      entries = Object.fromEntries(files);
    } catch(e) {
      entries = {};
      files.forEach((v, k) => entries[k] = v);
    }
  } else if (typeof files.toJSON === 'function') {
    entries = files.toJSON();
  }

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
  if (typeof map.toJSON === 'function') return map.toJSON();
  if (map instanceof Map) {
    try {
      return Object.fromEntries(map);
    } catch(e) {
      const obj = {};
      map.forEach((v, k) => obj[k] = v);
      return obj;
    }
  }
  if (typeof map === 'object') return map;
  return {};
};
