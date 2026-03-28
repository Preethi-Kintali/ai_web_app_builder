import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { getProjects, createProject, deleteProject } from '../services/projectService.js';
import '../styles/dashboard.css';

function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        showToast('Failed to load projects', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleNewProject = async () => {
    setCreating(true);
    try {
      const project = await createProject('Untitled Project');
      navigate(`/builder/${project._id}`);
    } catch (err) {
      showToast('Failed to create project', 'error');
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      showToast('Project deleted', 'success');
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleOpen = (id) => {
    navigate(`/builder/${id}`);
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting">👋 Good to see you,</div>
          <h1 className="dashboard-title">
            {user?.name?.split(' ')[0] || 'Builder'}'s{' '}
            <span>Projects</span>
          </h1>
        </div>
        <button
          className="btn-new-project"
          onClick={handleNewProject}
          disabled={creating}
        >
          {creating ? '⏳ Creating...' : '+ New Project'}
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-label">Total Projects</div>
          <div className="stat-card-value">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Deployed Apps</div>
          <div className="stat-card-value">
            {projects.filter((p) => p.deployStatus === 'live').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Public Apps</div>
          <div className="stat-card-value">
            {projects.filter((p) => p.isPublic).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Generations</div>
          <div className="stat-card-value">
            {projects.reduce((sum, p) => sum + (p.versions?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="dashboard-section-title">
        {loading ? 'Loading...' : `All Projects (${projects.length})`}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">🚀</div>
              <h3>No projects yet</h3>
              <p>
                Create your first project and describe what you want to build.
                Gemini AI will generate the code instantly.
              </p>
              <button className="btn-new-project" onClick={handleNewProject} disabled={creating}>
                {creating ? 'Creating...' : '+ Create First Project'}
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
