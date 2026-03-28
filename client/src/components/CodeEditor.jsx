import { useState } from 'react';

const FILE_LANG_LABELS = {
  'index.html': { label: 'HTML', icon: '🌐' },
  'styles.css':  { label: 'CSS',  icon: '🎨' },
  'script.js':   { label: 'JS',   icon: '⚡' },
};

function getFileLabel(filename) {
  if (FILE_LANG_LABELS[filename]) return FILE_LANG_LABELS[filename];
  if (filename.endsWith('.html')) return { label: 'HTML', icon: '🌐' };
  if (filename.endsWith('.css'))  return { label: 'CSS',  icon: '🎨' };
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return { label: 'JS', icon: '⚡' };
  return { label: filename.split('.').pop()?.toUpperCase() || 'FILE', icon: '📄' };
}

/**
 * Multi-file tabbed code editor.
 *
 * Props:
 *   files    — object: { 'index.html': '...', 'styles.css': '...', 'script.js': '...' }
 *   onChange — (filename, newContent) => void
 *   readOnly — boolean
 *
 * Legacy fallback:
 *   code     — string (single HTML) — shown as a single "index.html" tab
 */
function CodeEditor({ files, onChange, readOnly = false, code }) {
  // Normalise: if no files object provided, wrap legacy code string
  const resolvedFiles =
    files && Object.keys(files).length > 0
      ? files
      : code
      ? { 'index.html': code }
      : {};

  const fileNames = Object.keys(resolvedFiles);
  const [activeFile, setActiveFile] = useState(() => fileNames[0] || 'index.html');

  // Keep active-file in sync if the file list changes (e.g. after a new generation)
  const currentActive = resolvedFiles[activeFile] !== undefined ? activeFile : fileNames[0] || 'index.html';

  const handleChange = (e) => {
    if (readOnly) return;
    onChange && onChange(currentActive, e.target.value);
  };

  if (fileNames.length === 0) {
    return (
      <div className="code-editor-container">
        <div className="code-editor-empty">
          <span>💡 Generate an app to see the code here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="code-editor-container">
      {/* File tabs */}
      <div className="code-editor-tabs">
        {fileNames.map((name) => {
          const { label, icon } = getFileLabel(name);
          return (
            <button
              key={name}
              className={`code-editor-tab ${currentActive === name ? 'active' : ''}`}
              onClick={() => setActiveFile(name)}
              title={name}
            >
              {icon} {label}
            </button>
          );
        })}
        <span className="code-editor-filename">{currentActive}</span>
      </div>

      {/* Editor area */}
      <textarea
        className="code-editor-textarea"
        value={resolvedFiles[currentActive] ?? ''}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={`// ${currentActive} content will appear here`}
      />
    </div>
  );
}

export default CodeEditor;
