function ToolReportSheet({ report, onClose }) {
  if (!report) return null

  return (
    <div className="tool-report-overlay animate-fade-in">
      <div className="tool-report-card glass-card">
        <div className="tool-report-head">
          <div>
            <span className="card-tag">TEST REPORT</span>
            <h3>{report.title}</h3>
            {report.subtitle ? <p>{report.subtitle}</p> : null}
          </div>
          <button className="exit-btn" onClick={onClose}>Close</button>
        </div>

        <div className="tool-report-result">
          <span className="tool-report-label">Primary Result</span>
          <strong>{report.result}</strong>
        </div>

        {report.metrics?.length ? (
          <div className="tool-report-grid">
            {report.metrics.map((metric) => (
              <div key={metric.label} className="tool-report-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {report.notes?.length ? (
          <div className="tool-report-notes">
            {report.notes.map((note) => (
              <div key={note} className="tool-report-note">{note}</div>
            ))}
          </div>
        ) : null}

        <button className="btn-primary glow-btn tool-report-action" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

export default ToolReportSheet
