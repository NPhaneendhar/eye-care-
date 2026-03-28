function PatientSessionPanel({
  patientName,
  setPatientName,
  selectedEye,
  setSelectedEye,
  activeSession,
  sessionHistory,
  onStartSession,
  onFinishSession,
}) {
  return (
    <div className="card glass session-card animate-fade-in">
      <div className="session-head">
        <div>
          <span className="card-tag">PATIENT SESSION</span>
          <h3>Clinical Screening Flow</h3>
        </div>
        {activeSession ? <span className="session-badge live">Active</span> : <span className="session-badge">Standby</span>}
      </div>

      {!activeSession ? (
        <div className="session-form">
          <label className="session-label">
            Patient Name
            <input
              className="session-input"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
          </label>

          <div className="eye-choice">
            {['Right Eye', 'Left Eye'].map((eye) => (
              <button
                key={eye}
                className={`eye-chip ${selectedEye === eye ? 'selected' : ''}`}
                onClick={() => setSelectedEye(eye)}
              >
                {eye}
              </button>
            ))}
          </div>

          <button className="btn-primary glow-btn" onClick={onStartSession}>
            Start Patient Session
          </button>
        </div>
      ) : (
        <div className="session-active">
          <div className="session-meta">
            <div><span className="session-label-text">Patient</span><strong>{activeSession.patientName}</strong></div>
            <div><span className="session-label-text">Eye</span><strong>{activeSession.eye}</strong></div>
            <div><span className="session-label-text">Started</span><strong>{activeSession.startedAtLabel}</strong></div>
          </div>
          <button className="btn-secondary" onClick={onFinishSession}>Finish Session & PDF</button>
        </div>
      )}

      <div className="session-timeline">
        <div className="session-subhead">
          <h4>Recent Timeline</h4>
          <span>{sessionHistory.length} saved</span>
        </div>
        {sessionHistory.length === 0 ? (
          <p className="hint">No saved sessions yet. Start a session to build a patient history timeline.</p>
        ) : (
          sessionHistory.map((session) => (
            <div key={session.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-row">
                  <strong>{session.patientName}</strong>
                  <span>{session.eye}</span>
                </div>
                <div className="timeline-row muted">
                  <span>{session.startedAtLabel}</span>
                  <span>{session.completedAtLabel || 'In progress'}</span>
                </div>
                <div className="timeline-row muted">
                  <span>Acuity: {session.results?.acuity || '--'}</span>
                  <span>Axis: {session.results?.astigmatism || '--'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PatientSessionPanel
