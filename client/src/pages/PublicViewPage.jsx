import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProjectAPI } from '../services/aiToolsService';

function PublicViewPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getPublicProjectAPI(projectId);
        setProject(data);
      } catch (err) {
        setError('Project not found, or it is not marked as public.');
      }
    };
    fetchProject();
  }, [projectId]);

  if (error) {
    return (
      <div className="public-error-page">
        <div className="public-error-card">
          <h2>Oops!</h2>
          <p>{error}</p>
          <Link to="/" className="btn-primary">Go to Prompt2Page Homepage</Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="public-view-container">
      <div className="public-view-header">
        <div className="public-header-left">
          <span className="public-brand">⚡ Prompt2Page</span>
          <span className="public-divider">/</span>
          <span className="public-title" title={project.title}>{project.title}</span>
        </div>
        <div className="public-header-right">
          <Link to="/" className="btn-ghost" style={{ fontSize: '13px' }}>
            Build your own app for free →
          </Link>
        </div>
      </div>
      <div className="public-iframe-container">
        <iframe
          srcDoc={project.generatedCode}
          sandbox="allow-scripts allow-same-origin"
          title={project.title}
        />
      </div>
    </div>
  );
}

export default PublicViewPage;
