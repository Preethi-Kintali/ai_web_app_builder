import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { ToastContext } from '../context/ToastContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import VersionHistory from '../components/VersionHistory.jsx';
import PromptTemplates from '../components/PromptTemplates.jsx';
import ExplainDrawer from '../components/ExplainDrawer.jsx';
import PublishModal from '../components/PublishModal.jsx';
import RefactorPanel from '../components/RefactorPanel.jsx';
import DeployPanel from '../components/DeployPanel.jsx';
import VisualEditor from '../components/VisualEditor.jsx';
import { useCollabSocket } from '../hooks/useCollabSocket.js';

import { getProject, updateProject } from '../services/projectService.js';
import { generateCode } from '../services/generationService.js';
import { 
  getProjectVersionsAPI, 
  restoreVersionAPI, 
  explainCodeAPI, 
  fixCodeAPI, 
  toggleShareAPI,
  refactorCodeAPI,
  deployProjectAPI,
  getDeployStatusAPI
} from '../services/aiToolsService.js';

import '../styles/builder.css';

function BuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('');
  const [files, setFiles] = useState({});
  const [activeTab, setActiveTab] = useState('preview'); // preview | code | history | visual
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Title editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Feature upgrades state
  const [versions, setVersions] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [explainText, setExplainText] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  
  // Phase 4 & 5 state
  const [showRefactor, setShowRefactor] = useState(false);
  const [refactorLoading, setRefactorLoading] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [deployUrl, setDeployUrl] = useState(null);
  const [deployLoading, setDeployLoading] = useState(false);

  // Phase 9 Collab socket hook
  const handleIncomingCode = (newFiles, changedFile, from) => {
    setFiles(newFiles);
    // Best-effort bundle for single-string code logic (LivePreview fallback)
    if (newFiles['index.html']) {
      let codeStr = newFiles['index.html'];
      if (newFiles['styles.css']) codeStr = codeStr.replace('</head>', `<style>\\n${newFiles['styles.css']}\\n</style>\\n</head>`);
      if (newFiles['script.js']) codeStr = codeStr.replace('</body>', `<script>\\n${newFiles['script.js']}\\n</script>\\n</body>`);
      setCode(codeStr);
    }
  };
  
  const handleIncomingChat = (message) => {
    setMessages((prev) => [...prev, { role: 'user', content: message.content, timestamp: new Date() }]);
  };

  const { collabCount, isConnected, emitCodeChange, emitChatMessage } = useCollabSocket(
    projectId, user, handleIncomingCode, handleIncomingChat
  );

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(projectId);
        setProject(data);
        setMessages(data.messages || []);
        setCode(data.generatedCode || '');
        setFiles(data.files || {});
        setTitleInput(data.title);
        setIsPublic(data.isPublic || false);
        setDeployStatus(data.deployStatus || null);
        setDeployUrl(data.deployUrl || null);
        
        // Fetch formatted versions
        const verData = await getProjectVersionsAPI(projectId);
        setVersions(verData.versions || []);
        
      } catch (err) {
        showToast('Failed to load project', 'error');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ================= HANDLERS ================= */

  const handleSend = async (prompt) => {
    const userMsg = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await generateCode(projectId, prompt);
      setMessages(result.messages);
      setCode(result.code);
      setFiles(result.files);
      setProject((prev) => ({ ...prev, title: result.title }));
      setTitleInput(result.title);
      
      // Update versions list dynamically
      const verData = await getProjectVersionsAPI(projectId);
      setVersions(verData.versions || []);
      
      setActiveTab('preview');
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      const msg = err.response?.data?.message || 'Generation failed. Try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionIndex) => {
    if (!window.confirm("Restore this version? Your current code will be saved in history.")) return;
    try {
      const result = await restoreVersionAPI(projectId, versionIndex);
      setCode(result.code);
      setFiles(result.files);
      setMessages(result.messages);
      
      const verData = await getProjectVersionsAPI(projectId);
      setVersions(verData.versions || []);
      setActiveTab('preview');
      showToast('Version restored successfully', 'success');
    } catch (err) {
      showToast('Failed to restore version', 'error');
    }
  };

  const handleFix = async () => {
    if (!code || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: '🔧 Fix any errors in my code', timestamp: new Date() }]);
    
    try {
      const result = await fixCodeAPI(projectId);
      setCode(result.code);
      setFiles(result.files);
      setMessages(result.messages);
      
      const verData = await getProjectVersionsAPI(projectId);
      setVersions(verData.versions || []);
      showToast('Code fixed successfully', 'success');
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      showToast('Failed to auto-fix code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!code) return;
    setShowExplain(true);
    setExplainText('');
    setExplainLoading(true);
    try {
      const explanation = await explainCodeAPI(projectId);
      setExplainText(explanation);
    } catch (err) {
      setExplainText('Failed to get explanation. Please try again.');
      showToast('Failed to explain code', 'error');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleShareToggle = async () => {
    try {
      const result = await toggleShareAPI(projectId);
      setIsPublic(result.isPublic);
      if (result.isPublic) {
        showToast('App published successfully!', 'success');
      } else {
        showToast('App is now private', 'success');
      }
    } catch (err) {
      showToast('Failed to change publish status', 'error');
    }
  };

  const handleExportZip = async () => {
    if (!code) return;
    const zip = new JSZip();
    zip.file('index.html', code);
    zip.file('README.md', '# Generated by Prompt2Page\n\nOpen `index.html` in your browser to view your app.');
    
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Explicitly cast to zip
    const blob = new Blob([content], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);

    // Sanitize title to ensure a valid zip filename
    let safeTitle = (project?.title || 'app').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (!safeTitle) safeTitle = 'app';

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${safeTitle}_export.zip`;
    document.body.appendChild(a);
    a.click();
    
    // Give the browser time to register the click and start the download
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    showToast('ZIP exported successfully!', 'success');
  };

  const handleTitleSave = async () => {
    if (!titleInput.trim() || titleInput === project?.title) {
      setEditingTitle(false);
      return;
    }
    try {
      await updateProject(projectId, { title: titleInput.trim() });
      setProject((prev) => ({ ...prev, title: titleInput.trim() }));
      setEditingTitle(false);
      showToast('Title updated', 'success');
    } catch (err) {
      showToast('Failed to update title', 'error');
    }
  };

  const handleRefactor = async (action) => {
    if (!code) return;
    setRefactorLoading(true);
    setLoading(true);
    try {
      const result = await refactorCodeAPI(projectId, action);
      setCode(result.code);
      setFiles(result.files);
      setMessages(result.messages);
      
      const verData = await getProjectVersionsAPI(projectId);
      setVersions(verData.versions || []);
      showToast('Code refactored successfully', 'success');
      setActiveTab('preview');
    } catch (err) {
      showToast('Failed to refactor code', 'error');
    } finally {
      setRefactorLoading(false);
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!code) return;
    setDeployLoading(true);
    try {
      const result = await deployProjectAPI(projectId);
      setDeployStatus(result.status);
      setDeployUrl(result.url);
      setProject(prev => ({...prev, deployStatus: result.status, deployUrl: result.url}));
    } catch (err) {
      showToast('Deploy failed', 'error');
    } finally {
      setDeployLoading(false);
    }
  };

  const handleFileChange = (filename, newContent) => {
    const updatedFiles = { ...files, [filename]: newContent };
    setFiles(updatedFiles);
    // Only update local code string for basic preview; a full update cycle requires re-bundling 
    emitCodeChange(updatedFiles, filename);
  };
  
  const handleVisualEditSync = (newHtml) => {
    const updatedFiles = { ...files, 'index.html': newHtml };
    setFiles(updatedFiles);
    setCode(newHtml);
    emitCodeChange(updatedFiles, 'index.html');
  };

  if (fetching) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="builder-page">
      {/* ---- LEFT: CHAT ---- */}
      <div className="builder-chat-panel">
        <div className="chat-panel-header">
          <button className="chat-panel-back" onClick={() => navigate('/dashboard')}>
            ← My Projects
          </button>
          
          {editingTitle ? (
            <input
              className="chat-panel-title-input"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              autoFocus
            />
          ) : (
            <div className="chat-panel-title" onClick={() => setEditingTitle(true)} title="Click to rename">
              {project?.title || 'Untitled Project'}
            </div>
          )}
          
          <div className="chat-panel-subtitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span>{messages.length} prompts sent</span>
            <button className="panel-btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setShowTemplates(true)}>
              ✨ Templates
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">✨</div>
              <div className="chat-empty-title">What will you build today?</div>
              <div className="chat-empty-subtitle">
                Describe your app in plain English, or pick a template from above!
              </div>
              <button className="btn-primary" onClick={() => setShowTemplates(true)}>
                Browse Prompt Templates
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {loading && (
                <div className="chat-typing-indicator">
                  <div className="chat-typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="chat-typing-text">AI is working...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} loading={loading} disabled={fetching} />
      </div>

      {/* ---- RIGHT: PREVIEW / CODE / HISTORY ---- */}
      <div className="builder-right-panel">
        <div className="panel-toolbar">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              👁 Preview
            </button>
            <button
              className={`panel-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              {'</> Code'}
            </button>
            <button
              className={`panel-tab ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              🪄 Visual
            </button>
            <button
              className={`panel-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              ⏳ History
            </button>
          </div>
          
          <div className="panel-toolbar-spacer" />
          
          {isConnected && (
            <div className="collab-badge" title="Users collaborating right now">
              <span className={`collab-badge-dot ${collabCount > 0 ? '' : 'offline'}`} />
              {collabCount} {collabCount === 1 ? 'user' : 'users'}
            </div>
          )}
          
          {/* Tool Buttons */}
          <button 
            className={`panel-btn ${deployStatus === 'live' ? 'active' : ''}`} 
            onClick={() => setShowDeploy(true)}
            disabled={!code}
          >
            {deployStatus === 'live' ? '🌍 Deployed' : '🌍 Deploy'}
          </button>
          
          <button 
            className="panel-btn" 
            onClick={() => setShowRefactor(true)}
            disabled={!code || loading}
          >
            ✨ Refactor
          </button>
          
          <button 
            className={`panel-btn ${isPublic ? 'active' : ''}`} 
            onClick={() => setShowPublish(true)}
          >
            {isPublic ? '🚀 Published' : '🚀 Publish'}
          </button>
          
          <button 
            className="panel-btn" 
            onClick={handleExplain} 
            disabled={!code || loading}
          >
            🔍 Explain
          </button>

          <button 
            className="panel-btn" 
            onClick={handleFix} 
            disabled={!code || loading}
          >
            🧪 Fix AI Tweaks
          </button>

          <button
            className="panel-download-btn"
            onClick={handleExportZip}
            disabled={!code}
          >
            ↓ Export ZIP
          </button>
        </div>

        {activeTab === 'preview' && <LivePreview code={code} />}
        {activeTab === 'visual' && <VisualEditor code={code} onCodeSync={handleVisualEditSync} />}
        {activeTab === 'code' && <CodeEditor files={files} code={code} onChange={handleFileChange} readOnly={false} />}
        {activeTab === 'history' && (
          <VersionHistory 
            versions={versions} 
            onRestore={handleRestore} 
            currentCode={code} 
          />
        )}
      </div>

      {/* ---- OVERLAYS & MODALS ---- */}
      {showTemplates && (
        <PromptTemplates 
          onSelect={handleSend} 
          onClose={() => setShowTemplates(false)} 
        />
      )}
      
      {showExplain && (
        <ExplainDrawer 
          explanation={explainText} 
          loading={explainLoading} 
          onClose={() => setShowExplain(false)} 
        />
      )}

      {showPublish && (
        <PublishModal
          isPublic={isPublic}
          url={`${window.location.origin}/view/${projectId}`}
          onToggle={handleShareToggle}
          onClose={() => setShowPublish(false)}
        />
      )}

      {showRefactor && (
        <RefactorPanel
          onRefactor={handleRefactor}
          loading={refactorLoading}
          onClose={() => setShowRefactor(false)}
        />
      )}

      {showDeploy && (
        <DeployPanel
          status={deployStatus}
          url={deployUrl}
          isMock={!deployUrl?.includes('netlify')} // Naive check for now
          onDeploy={handleDeploy}
          loading={deployLoading}
          onClose={() => setShowDeploy(false)}
        />
      )}
    </div>
  );
}

export default BuilderPage;
