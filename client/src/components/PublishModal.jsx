import React from 'react';

function PublishModal({ isPublic, url, onToggle, onClose }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    // Optional: could add an internal copied state here, but simple is fine
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content publish-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>🌐 Publish Your App</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="publish-modal-body" style={{ padding: '24px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--color-primary)', borderRadius: '4px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              <strong>Note:</strong> Since Prompt2Page is running locally, this link works on your machine and local network only. 
              To share with the world, export the ZIP and deploy it to services like Vercel or Netlify.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Public Access</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Allow anyone with the link to view</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={isPublic} onChange={onToggle} />
                <span className="slider round"></span>
              </label>
            </div>

            {isPublic && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideUp 0.3s ease' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Shareable Link</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={url} 
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-light)', fontSize: '0.85rem' }}
                  />
                  <button onClick={handleCopy} className="btn-primary" style={{ shrink: 0, padding: '0 16px' }}>
                    Copy
                  </button>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'underline', marginTop: '4px' }}>
                  Visit site ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
