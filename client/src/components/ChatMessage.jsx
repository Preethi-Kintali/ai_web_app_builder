import ReactMarkdown from 'react-markdown';

function ChatMessage({ message, onOptionClick }) {
  const isUser = message.role === 'user';
  const isQuestion = message.mode === 'question';
  const isAnalysis = message.mode === 'analysis';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${isQuestion ? 'question-mode' : ''}`}>
      <div className="chat-bubble">
        {isAnalysis ? (
          <div className="analysis-report">
            <ReactMarkdown>{message.report || message.content}</ReactMarkdown>
          </div>
        ) : (
          <>
            <div className="message-text">{message.content}</div>
            
            {message.changes && Array.isArray(message.changes) && message.changes.length > 0 && (
              <div className="message-evolution">
                <div className="evolution-header">⚡ Evolution Notes:</div>
                <ul className="evolution-list">
                  {message.changes.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {isQuestion && message.options && message.options.length > 0 && (
              <div className="question-options">
                {message.options.map((opt, idx) => (
                  <button 
                    key={idx} 
                    className="option-card"
                    onClick={() => onOptionClick && onOptionClick(opt)}
                  >
                    <div className="option-label">{opt.label}</div>
                    <div className="option-desc">{opt.description}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="chat-message-time">{formatTime(message.timestamp || message.createdAt)}</div>
    </div>
  );
}

export default ChatMessage;
