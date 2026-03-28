const escapeHtml = (value) =>
  String(value ?? '--')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const metricRow = (label, value) => `
  <div class="metric">
    <span class="metric-label">${escapeHtml(label)}</span>
    <strong class="metric-value">${escapeHtml(value)}</strong>
  </div>
`

export const openPatientPdfReport = (session) => {
  if (typeof window === 'undefined' || !session) return

  const reportWindow = window.open('', '_blank', 'width=960,height=720')
  if (!reportWindow) return

  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>EyeCare Pro Patient Report</title>
      <style>
        :root {
          color-scheme: light;
          --ink: #0f172a;
          --muted: #475569;
          --line: #d9e2ec;
          --accent: #0ea5e9;
          --accent-soft: #e0f2fe;
          --surface: #ffffff;
          --bg: #f8fbff;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 32px;
          background: linear-gradient(180deg, #f8fbff, #eef6ff);
          color: var(--ink);
          font-family: "Segoe UI", Arial, sans-serif;
        }
        .report {
          max-width: 900px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
        }
        .head, .meta, .metrics, .footer { display: grid; gap: 16px; }
        .head {
          grid-template-columns: 1.4fr 1fr;
          align-items: start;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--line);
        }
        .brand {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: #0369a1;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1, h2, p { margin: 0; }
        h1 { margin-top: 14px; font-size: 34px; }
        .subtitle { margin-top: 8px; color: var(--muted); line-height: 1.6; }
        .meta {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .meta-card, .metric, .timeline-item {
          padding: 16px 18px;
          border-radius: 18px;
          border: 1px solid var(--line);
          background: #fbfdff;
        }
        .meta-label, .metric-label, .section-label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .meta-value, .metric-value {
          font-size: 20px;
          color: var(--ink);
        }
        .section {
          margin-top: 24px;
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .section-head h2 { font-size: 20px; }
        .metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .timeline {
          display: grid;
          gap: 12px;
        }
        .timeline-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: var(--muted);
          line-height: 1.5;
        }
        .footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }
        .disclaimer {
          padding: 14px 16px;
          border-radius: 16px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          line-height: 1.6;
        }
        .print-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }
        button {
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary { background: linear-gradient(135deg, #7dd3fc, #38bdf8); color: #082f49; }
        .secondary { background: #e2e8f0; color: #0f172a; }
        @media print {
          body { padding: 0; background: #ffffff; }
          .report { box-shadow: none; border: none; border-radius: 0; }
          .print-actions { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="report">
        <div class="head">
          <div>
            <span class="brand">EyeCare Pro Report</span>
            <h1>Patient Screening Summary</h1>
            <p class="subtitle">Combined output from the completed patient session. Use the browser print action to save this page as a PDF.</p>
          </div>
          <div class="meta">
            <div class="meta-card">
              <span class="meta-label">Patient</span>
              <strong class="meta-value">${escapeHtml(session.patientName)}</strong>
            </div>
            <div class="meta-card">
              <span class="meta-label">Eye Tested</span>
              <strong class="meta-value">${escapeHtml(session.eye)}</strong>
            </div>
            <div class="meta-card">
              <span class="meta-label">Started</span>
              <strong class="meta-value">${escapeHtml(session.startedAtLabel || '--')}</strong>
            </div>
            <div class="meta-card">
              <span class="meta-label">Completed</span>
              <strong class="meta-value">${escapeHtml(session.completedAtLabel || '--')}</strong>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <h2>Results Dashboard</h2>
            <span class="section-label">All tools summary</span>
          </div>
          <div class="metrics">
            ${metricRow('Acuity', session.results?.acuity)}
            ${metricRow('Color Vision', session.results?.colorVision)}
            ${metricRow('Astigmatism Axis', session.results?.astigmatism)}
            ${metricRow('Contrast', session.results?.contrast)}
            ${metricRow('Blink Score', session.results?.blink)}
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <h2>Session Timeline</h2>
            <span class="section-label">Recorded during screening</span>
          </div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-row"><strong>Session created</strong><span>${escapeHtml(session.startedAtLabel || '--')}</span></div>
              <div class="timeline-row"><span>Patient session opened for ${escapeHtml(session.eye)}</span><span>Status: Completed</span></div>
            </div>
            <div class="timeline-item">
              <div class="timeline-row"><strong>Tests included</strong><span>5 modules</span></div>
              <div class="timeline-row"><span>Acuity, Color Vision, Astigmatism, Contrast, Blink</span><span>Prepared for PDF export</span></div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="disclaimer">
            Disclaimer: This report is generated from an on-screen screening workflow and is not a medical diagnosis. Formal diagnosis and treatment require evaluation by a qualified eye-care professional.
          </div>
          <div class="print-actions">
            <button class="primary" onclick="window.print()">Print / Save as PDF</button>
            <button class="secondary" onclick="window.close()">Close</button>
          </div>
        </div>
      </div>
    </body>
  </html>`

  reportWindow.document.open()
  reportWindow.document.write(html)
  reportWindow.document.close()
}
