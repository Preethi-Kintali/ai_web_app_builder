import { useState } from 'react';

const REFACTOR_ACTIONS = [
  { id: 'optimize', label: '⚡ Optimize Code', desc: 'Improve performance and clean up code' },
  { id: 'make-responsive', label: '📱 Make Responsive', desc: 'Add mobile-first CSS media queries' },
  { id: 'convert-to-react', label: '⚛️ Convert to React', desc: 'Rewrite UI using React components' },
  { id: 'improve-ui', label: '🎨 Improve UI/UX', desc: 'Dramatically upgrade the visual design' },
  { id: 'add-dark-mode', label: '🌙 Add Dark Mode', desc: 'Add a dark/light theme toggle' },
  { id: 'improve-accessibility', label: '♿ Improve Accessibility', desc: 'Ensure WCAG AA compliance' },
];

function RefactorPanel({ onRefactor, loading, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content refactor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Refactoring Engine</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-subtitle">
          Select an action to instantly transform your code using AI.
        </div>
        
        <div className="templates-scroll-area">
          <div className="template-grid">
            {REFACTOR_ACTIONS.map((action) => (
              <button
                key={action.id}
                className="template-card refactor-card"
                onClick={() => {
                  onRefactor(action.id);
                  onClose();
                }}
                disabled={loading}
              >
                <div className="template-card-text" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                  {action.label}
                </div>
                <div className="template-card-text" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {action.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefactorPanel;
