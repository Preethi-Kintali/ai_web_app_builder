import React from 'react';

const CATEGORIES = [
  {
    title: 'Start Here',
    prompts: [
      { icon: '🎯', text: 'Build a beautiful, modern todo app with dark mode, animations, and local storage.' },
      { icon: '🌐', text: 'Create a personal developer portfolio landing page with a hero header, skills grid, and contact form.' },
      { icon: '📝', text: 'Design a sleek markdown editor with side-by-side live preview and a clean minimal interface.' },
    ]
  },
  {
    title: 'Dashboards & Data',
    prompts: [
      { icon: '📊', text: 'Make a SaaS analytics dashboard with chart placeholders, key metric cards, and a collapsible sidebar navigation.' },
      { icon: '💰', text: 'Build a finance tracker dashboard that displays income, expenses, and a recent transactions table.' },
      { icon: '👥', text: 'Design a user management admin panel with a searchable data table, pagination, and action dropdowns.' },
    ]
  },
  {
    title: 'Pages & Layouts',
    prompts: [
      { icon: '🛒', text: 'Create an e-commerce product page with an image gallery, size selector, add to cart button, and reviews section.' },
      { icon: '🚀', text: 'Design a high-converting startup landing page featuring a value prop hero, feature columns, and a 3-tier pricing table.' },
      { icon: '🔐', text: 'Build a beautiful split-screen login and registration page with social auth buttons and form validation styling.' },
    ]
  }
];

function PromptTemplates({ onSelect, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content templates-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Prompt Templates</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="modal-subtitle">Kickstart your idea with pre-written, highly detailed prompts proven to yield great results.</p>
        
        <div className="templates-scroll-area">
          {CATEGORIES.map(cat => (
            <div key={cat.title} className="template-category">
              <h3>{cat.title}</h3>
              <div className="template-grid">
                {cat.prompts.map((p, i) => (
                  <button 
                    key={i} 
                    className="template-card"
                    onClick={() => {
                      onSelect(p.text);
                      onClose();
                    }}
                  >
                    <div className="template-card-icon">{p.icon}</div>
                    <div className="template-card-text">{p.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromptTemplates;
