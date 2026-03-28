import { useState } from 'react';

function ChatInput({ onSend, loading, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || loading || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input-textarea"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'AI is generating...' : 'Describe what you want to build...'}
          disabled={loading || disabled}
        />
        <button
          className="chat-input-send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || loading || disabled}
          title="Send (Enter)"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
