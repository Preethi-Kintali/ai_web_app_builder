function LivePreview({ code }) {
  if (!code) {
    return (
      <div className="preview-empty">
        <p className="preview-empty-icon">◈</p>
        <p className="preview-empty-title">Your app will appear here</p>
        <p className="preview-empty-subtitle">Describe what you want to build in the chat</p>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <iframe
        srcDoc={code}
        sandbox="allow-scripts"
        title="Live Preview"
      />
    </div>
  );
}

export default LivePreview;
