import { useRef, useEffect } from 'react';

/**
 * VisualEditor
 * Injects a basic contenteditable overlay into the iframe to allow WYSIWYG text edits.
 * Works natively by injecting script into the iframe that reports mutations back.
 */
function VisualEditor({ code, onCodeSync }) {
  const iframeRef = useRef(null);
  
  // Base code string from multi-file bundle
  const baseCode = code || '';

  useEffect(() => {
    const handleMessage = (event) => {
      // Must verify origin if not locally hosted in production, but we trust local messages
      if (event.data?.type === 'VISUAL_EDIT_SYNC') {
        const newHtml = event.data.html;
        onCodeSync(newHtml);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCodeSync]);

  const injectVisualEditorCode = (baseHtml) => {
    if (!baseHtml) return '';
    
    // Inject visual editing script into the head
    const injectionScript = `
      <style>
        [contenteditable="true"] {
          outline: 2px dashed rgba(124, 58, 237, 0.5) !important;
          outline-offset: 2px;
          transition: outline 0.2s;
        }
        [contenteditable="true"]:focus {
          outline: 2px solid rgba(124, 58, 237, 1) !important;
          background: rgba(124, 58, 237, 0.1);
        }
      </style>
      <script>
        // Make text elements editable
        document.addEventListener('DOMContentLoaded', () => {
          const makeEditable = () => {
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not(.no-edit), a, button');
            textElements.forEach(el => {
              if(!el.isContentEditable && el.children.length === 0) {
                 el.setAttribute('contenteditable', 'true');
                 
                 el.addEventListener('blur', () => {
                    // Send entire updated DOM back to parent
                    // Clean up contenteditables before sending
                    const clone = document.documentElement.cloneNode(true);
                    clone.querySelectorAll('[contenteditable]').forEach(node => {
                      node.removeAttribute('contenteditable');
                    });
                    
                    window.parent.postMessage({
                      type: 'VISUAL_EDIT_SYNC',
                      html: '<!DOCTYPE html>\\n<html>' + clone.innerHTML + '</html>'
                    }, '*');
                 });
              }
            });
          };
          
          makeEditable();
          
          // Re-run if DOM changes (e.g. React/Dynamic rendering)
          const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (let m of mutations) {
              if (m.type === 'childList' && m.addedNodes.length > 0) shouldUpdate = true;
            }
            if (shouldUpdate) setTimeout(makeEditable, 500);
          });
          observer.observe(document.body, { childList: true, subtree: true });
        });
      </script>
    `;

    if (baseHtml.includes('</head>')) {
      return baseHtml.replace('</head>', `${injectionScript}\n</head>`);
    }
    return baseHtml + injectionScript;
  };

  const srcDoc = injectVisualEditorCode(baseCode);

  return (
    <div className="visual-editor-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div className="visual-editor-toolbar" style={{ padding: '8px 16px', background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🪄</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Visual Editing Active</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click any text element in the preview to edit it directly.</span>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        title="Visual Editor"
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

export default VisualEditor;
