import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.jsx';
import '../styles/landing.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">⚡ Prompt2Page</span>
        <div className="landing-nav-right">
          <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-badge">✨ Powered by Gemini AI</div>
        <h1 className="landing-title">
          Build Web Apps<br />
          <span className="landing-title-gradient">From Plain English</span>
        </h1>
        <p className="landing-subtitle">
          Describe what you want in natural language. Prompt2Page instantly generates
          complete, working HTML, CSS, and JavaScript — no coding required.
        </p>
        <div className="landing-cta-group">
          <button className="btn-cta" onClick={() => navigate('/login')}>
            ⚡ Start Building for Free
          </button>
          <button className="btn-cta-outline" onClick={() => navigate('/login')}>
            View Demo →
          </button>
        </div>

        {/* Demo Box */}
        <div className="landing-demo">
          <div className="demo-header">
            <div className="demo-dot red" />
            <div className="demo-dot yellow" />
            <div className="demo-dot green" />
            <div className="demo-title-bar">prompt2page.app — AI Builder</div>
          </div>
          <div className="demo-body">
            <div className="demo-prompt-box">
              <div className="demo-prompt-label">💬 Your Prompt</div>
              Build me a beautiful landing page for a SaaS product called "CloudSync"
              with a hero section, feature grid, and pricing table. Dark theme, modern design.
            </div>
            <div className="demo-output">
              <div className="demo-output-line" />
              <div className="demo-output-line" />
              <div className="demo-output-line" />
              <div className="demo-output-line" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-features">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From Idea to Live App in Seconds</h2>
        <p className="section-subtitle">
          No setup, no code, no frustration. Just describe and build.
        </p>
        <div className="features-grid">
          <FeatureCard
            icon="💬"
            title="1. Describe Your App"
            description="Type what you want in plain English — a landing page, portfolio, dashboard, game, or any web app you can imagine."
          />
          <FeatureCard
            icon="⚡"
            title="2. AI Generates Code"
            description="Gemini AI instantly writes complete, production-ready HTML, CSS, and JavaScript tailored to your description."
          />
          <FeatureCard
            icon="👁️"
            title="3. Preview & Iterate"
            description="See your app live in real-time. Refine it through conversation — 'make the hero bigger', 'add a dark mode toggle'."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">⚡ Prompt2Page</div>
        <p>AI-Powered Web App Builder — Built with Gemini AI</p>
      </footer>
    </div>
  );
}

export default LandingPage;
