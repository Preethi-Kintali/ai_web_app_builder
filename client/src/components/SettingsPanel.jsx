import { useState, useEffect } from 'react';
import { getPreferencesAPI, updatePreferencesAPI } from '../services/aiToolsService.js';

function SettingsPanel({ onClose, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    framework: 'vanilla',
    codeStyle: 'commented',
    colorScheme: ''
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await getPreferencesAPI();
        if (data) setPrefs(data);
      } catch (err) {
        console.error('Failed to load preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleChange = (field, value) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferencesAPI(prefs);
      showToast('Preferences saved! They will apply to future generations.', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="explain-drawer-overlay" onClick={onClose}>
      <div className="explain-drawer" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
        <div className="drawer-header">
          <h2>⚙️ AI Generation Settings</h2>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        
        <div className="drawer-content settings-content">
          {loading ? (
            <div className="drawer-loading"><div className="spinner"/></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                These preferences guide the AI exactly how you want your code generated across all your projects.
              </p>

              {/* Framework */}
              <div className="settings-group">
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Preferred Framework</label>
                <select 
                  className="settings-select" 
                  value={prefs.framework}
                  onChange={(e) => handleChange('framework', e.target.value)}
                  style={selectStyle}
                >
                  <option value="vanilla">Vanilla HTML/JS (Best mapping/speed)</option>
                  <option value="react">React (via CDN in browser)</option>
                  <option value="vue">Vue 3 (via CDN in browser)</option>
                </select>
              </div>

              {/* Theme */}
              <div className="settings-group">
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>UI Theme Target</label>
                <select 
                  className="settings-select" 
                  value={prefs.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  style={selectStyle}
                >
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                  <option value="auto">System / Built-in Toggle</option>
                </select>
              </div>

              {/* Color Scheme */}
              <div className="settings-group">
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Primary Color Palette</label>
                <input 
                  type="text" 
                  value={prefs.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                  placeholder="e.g., 'Purple & Neon Pink', 'Ocean Blue'"
                  style={{ ...selectStyle, cursor: 'text' }}
                />
              </div>

              {/* Code Style */}
              <div className="settings-group">
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Code Style</label>
                <select 
                  className="settings-select" 
                  value={prefs.codeStyle}
                  onChange={(e) => handleChange('codeStyle', e.target.value)}
                  style={selectStyle}
                >
                  <option value="commented">Verbose & Well-Commented</option>
                  <option value="minimal">Minimal & Clean (No comments)</option>
                </select>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleSave} 
                  disabled={saving}
                  style={{ width: '100%' }}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

export default SettingsPanel;
