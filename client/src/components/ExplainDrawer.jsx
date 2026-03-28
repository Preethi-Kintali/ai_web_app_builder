import React from 'react';
import ReactMarkdown from 'react-markdown';

function ExplainDrawer({ explanation, loading, onClose }) {
  return (
    <div className="explain-drawer-overlay" onClick={onClose}>
      <div className="explain-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>🔍 Code Explanation</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        
        <div className="drawer-content">
          {loading ? (
            <div className="drawer-loading">
              <div className="spinner"></div>
              <p>Analyzing architecture, styles, and logic...</p>
            </div>
          ) : !explanation ? (
            <div className="drawer-empty">No explanation available.</div>
          ) : (
            <div className="explain-text">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExplainDrawer;
