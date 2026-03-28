import { useState } from 'react';

function DeployPanel({ status, url, isMock, onDeploy, loading, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content deploy-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Deploy to Production</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="deploy-content" style={{ padding: '24px' }}>
          {status === 'live' ? (
            <div className="deploy-success" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ color: 'var(--color-primary-light)', marginBottom: '8px' }}>Your app is live!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                {isMock ? 'Mock deployment complete (set NETLIFY_TOKEN for real deploy).' : 'Successfully deployed to Netlify.'}
              </p>
              
              <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, wordBreak: 'break-all' }}
                >
                  {url}
                </a>
              </div>
              
              <button className="btn-primary" onClick={onDeploy} disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Redeploying...' : 'Deploy Update'}
              </button>
            </div>
          ) : (
            <div className="deploy-pending" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.8 }}>🌍</div>
              <h3 style={{ marginBottom: '8px' }}>Ready to ship?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                Deploy your code to a public URL instantly. 
                (Mocked locally unless NETLIFY_TOKEN is provided)
              </p>
              
              <button 
                className="btn-primary" 
                onClick={onDeploy} 
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Deploying...
                  </span>
                ) : (
                  '🚀 Deploy Now'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeployPanel;
