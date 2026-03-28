function ProjectCard({ project, onOpen, onDelete }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project._id);
  };

  const deployStatusConfig = {
    live: { label: 'Live', color: '#22c55e', icon: '🟢' },
    pending: { label: 'Deploying', color: '#eab308', icon: '🟡' },
    failed: { label: 'Failed', color: '#ef4444', icon: '🔴' },
  };

  const deployInfo = project.deployStatus ? deployStatusConfig[project.deployStatus] : null;

  return (
    <div className="project-card" onClick={() => onOpen(project._id)}>
      <div className="project-card-preview">
        {project.generatedCode ? (
          <iframe
            srcDoc={project.generatedCode}
            sandbox=""
            title={project.title}
          />
        ) : (
          <div className="project-card-preview-empty">
            <div className="project-card-preview-empty-icon">⚡</div>
            <p>No preview yet</p>
          </div>
        )}
      </div>
      <div className="project-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div className="project-card-title" title={project.title} style={{ flex: 1 }}>
            {project.title}
          </div>
          {project.isPublic && (
            <span className="project-badge project-badge-public" title="Public">🌐</span>
          )}
          {deployInfo && (
            <span
              className="project-badge"
              style={{ color: deployInfo.color }}
              title={`Deploy: ${deployInfo.label}`}
            >
              {deployInfo.icon}
            </span>
          )}
        </div>
        <div className="project-card-meta">
          Updated {formatDate(project.updatedAt)} &bull;{' '}
          {project.messages?.length || 0} messages
          {project.versions?.length > 0 && <> &bull; {project.versions.length} versions</>}
        </div>
        <div className="project-card-footer">
          <button className="project-card-open-btn" onClick={() => onOpen(project._id)}>
            Open Builder →
          </button>
          {project.deployUrl && project.deployStatus === 'live' && (
            <a
              className="project-card-live-btn"
              href={project.deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View deployed app"
            >
              🔗 Live
            </a>
          )}
          <button
            className="project-card-delete-btn"
            onClick={handleDelete}
            title="Delete project"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;

