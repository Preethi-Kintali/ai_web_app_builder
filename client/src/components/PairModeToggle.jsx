import React from 'react';
import '../styles/pair-toggle.css';

const PairModeToggle = ({ pairMode, onToggle }) => {
  return (
    <div className={`pair-mode-toggle ${pairMode ? 'active' : ''}`} onClick={onToggle}>
      <div className="toggle-track">
        <div className="toggle-thumb">
          {pairMode ? '🤝' : '⚡'}
        </div>
      </div>
      <span className="toggle-label">
        {pairMode ? 'Pair Mode' : 'Direct Mode'}
      </span>
      <div className="toggle-tooltip">
        {pairMode 
          ? 'AI will collaborate, ask questions, and suggest options before changing code.' 
          : 'AI will generate or change code immediately based on your prompt.'}
      </div>
    </div>
  );
};

export default PairModeToggle;
