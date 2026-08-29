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

  // Inject script to prevent dummy links from navigating and blanking out the iframe
  const injectLinkStopper = (html) => {
    if (!html) return '';
    const script = `
      <script>
        document.addEventListener('click', function(e) {
          const t = e.target.closest('a');
          if (t && (t.getAttribute('href') === '#' || t.getAttribute('href') === '')) {
            e.preventDefault();
          }
        });
      </script>
    `;
    if (html.includes('</body>')) {
      return html.replace('</body>', `${script}\n</body>`);
    }
    return html + script;
  };

  const safeCode = injectLinkStopper(code);

  return (
    <div className="preview-container">
      <iframe
        srcDoc={safeCode}
        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
        title="Live Preview"
      />
    </div>
  );
}

export default LivePreview;
