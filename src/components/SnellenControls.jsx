function SnellenControls({ ratio, onPrev, onNext, onFullscreen, isFullscreen, onRecalibrate }) {
  return (
    <div className="forensic-panel">
      <div className="forensic-row">
        <span>Current Row</span>
        <strong>{ratio}</strong>
      </div>
      <div className="snellen-controls">
        <button className="forensic-btn" onClick={onPrev}>Larger</button>
        <button className="forensic-btn" onClick={onNext}>Smaller</button>
        <button className="forensic-btn" onClick={onFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
      <button className="forensic-btn secondary" onClick={onRecalibrate}>Recalibrate</button>
    </div>
  )
}

export default SnellenControls
