function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutesStr} ${ampm}`;
  };

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-bubble">{message.content}</div>
      <div className="chat-message-time">{formatTime(message.timestamp)}</div>
    </div>
  );
}

export default ChatMessage;
