function ResultMetric({ label, value, note }) {
  return (
    <div className="result-metric">
      <span className="result-label">{label}</span>
      <strong>{value || '--'}</strong>
      {note ? <span className="result-note">{note}</span> : null}
    </div>
  )
}

function ResultsDashboard({ patientSummary, metrics, sessionHistory }) {
  return (
    <div className="card glass results-dashboard animate-fade-in">
      <div className="results-head">
        <div>
          <span className="card-tag">RESULTS DASHBOARD</span>
          <h3>Clinical Summary</h3>
        </div>
        <div className="results-patient">
          <strong>{patientSummary.name}</strong>
          <span>{patientSummary.eye}</span>
        </div>
      </div>

      <div className="results-grid">
        <ResultMetric label="Acuity" value={metrics.acuity} note={metrics.acuityNote} />
        <ResultMetric label="Color Vision" value={metrics.colorVision} note={metrics.colorVisionNote} />
        <ResultMetric label="Astigmatism Axis" value={metrics.astigmatism} note={metrics.astigmatismNote} />
        <ResultMetric label="Contrast" value={metrics.contrast} note={metrics.contrastNote} />
        <ResultMetric label="Blink Score" value={metrics.blink} note={metrics.blinkNote} />
      </div>

      <div className="results-footer">
        <div className="results-status">
          <span>Sessions Saved</span>
          <strong>{sessionHistory.length}</strong>
        </div>
        <div className="results-status">
          <span>Latest Check</span>
          <strong>{patientSummary.latestDate}</strong>
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard
