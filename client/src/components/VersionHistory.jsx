import React from 'react';

function VersionHistory({ versions, onRestore, currentCode }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="version-history-panel">
      <div className="version-history-header">
        <h3>Version History</h3>
        <p>Restore previous iterations of your app.</p>
      </div>
      
      {(!versions || versions.length === 0) && !currentCode ? (
        <div className="version-empty">
          <p>No history yet.</p>
          <span>Generate some code first!</span>
        </div>
      ) : null}

      <div className="version-list">
        {/* Mocking current as a card since we store history when it changes */}
        {currentCode && (
          <div className="version-card current">
            <div className="version-card-badge">Current</div>
            <div className="version-card-meta">Live in editor</div>
            <div className="version-card-preview">
              {currentCode.substring(0, 80)}...
            </div>
          </div>
        )}

        {versions && versions.map((v) => (
          <div key={v.index} className="version-card">
            <div className="version-card-meta">
              {formatDate(v.createdAt)}
            </div>
            <div className="version-card-preview">
              {v.preview}
            </div>
            <button 
              className="version-restore-btn"
              onClick={() => onRestore(v.index)}
            >
              ⏪ Restore Version
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VersionHistory;
