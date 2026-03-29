import { useEffect, useMemo, useRef, useState } from 'react'
import Calibration from './Calibration'
import { CARD_WIDTH_MM, getPxPerMm, loadCalibration, saveCalibration } from '../utils/measurement'

const LINE_COUNT = 24
const ANGLES = Array.from({ length: LINE_COUNT }, (_, index) => index * (180 / LINE_COUNT))
const DEFAULT_RECT_WIDTH = 320
const CHART_DIAMETER_MM = 140

const normalizeAxis = (angle) => {
  const normalized = angle % 180
  return normalized < 0 ? normalized + 180 : normalized
}

const averageAxialAngles = (angles) => {
  if (!angles.length) return null

  const { x, y } = angles.reduce(
    (acc, angle) => {
      const radians = (normalizeAxis(angle) * 2 * Math.PI) / 180
      return {
        x: acc.x + Math.cos(radians),
        y: acc.y + Math.sin(radians),
      }
    },
    { x: 0, y: 0 },
  )

  const doubled = (Math.atan2(y, x) * 180) / Math.PI
  return normalizeAxis(doubled / 2)
}

const angleLabel = (angle) => `${Math.round(normalizeAxis(angle))} deg`

function ClockDialCanvas({ pxPerMm, selectedAngles, lineCount = LINE_COUNT, onToggleAngle }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(320)

  const chartDiameterPx = useMemo(() => {
    if (!pxPerMm) return 320
    return Math.max(220, Math.min(520, pxPerMm * CHART_DIAMETER_MM))
  }, [pxPerMm])

  useEffect(() => {
    if (!wrapRef.current) return undefined

    const updateSize = () => {
      if (!wrapRef.current) return
      const available = wrapRef.current.clientWidth
      setCanvasSize(Math.max(220, Math.min(available, chartDiameterPx)))
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(wrapRef.current)
    window.addEventListener('resize', updateSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [chartDiameterPx])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.round(canvasSize)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const context = canvas.getContext('2d')
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, size, size)
    context.imageSmoothingEnabled = true

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, size, size)

    const center = size / 2
    const radius = size * 0.42
    const selectedSet = new Set(selectedAngles)

    context.save()
    context.translate(center, center)
    context.lineCap = 'round'
    context.lineWidth = Math.max(2, size * 0.008)

    for (let index = 0; index < lineCount; index += 1) {
      const angle = (index * Math.PI) / lineCount
      const deg = index * (180 / lineCount)
      const selected = selectedSet.has(deg)

      context.strokeStyle = selected ? '#ff4d6d' : '#111111'
      context.shadowBlur = selected ? 10 : 0
      context.shadowColor = selected ? 'rgba(255,77,109,0.45)' : 'transparent'
      context.beginPath()
      context.moveTo(-Math.cos(angle) * radius, -Math.sin(angle) * radius)
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      context.stroke()
    }

    context.restore()

    context.beginPath()
    context.fillStyle = '#111111'
    context.arc(center, center, Math.max(4, size * 0.015), 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = 'rgba(17,17,17,0.15)'
    context.lineWidth = 1
    context.beginPath()
    context.arc(center, center, radius, 0, Math.PI * 2)
    context.stroke()
  }, [canvasSize, lineCount, selectedAngles])

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    const raw = (Math.atan2(y, x) * 180) / Math.PI
    const normalized = normalizeAxis(raw < 0 ? raw + 180 : raw)
    const step = 180 / lineCount
    const snapped = Math.round(normalized / step) * step
    onToggleAngle(normalizeAxis(snapped === 180 ? 0 : snapped))
  }

  return (
    <div className="astig-canvas-wrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="astig-canvas"
        onClick={handleCanvasClick}
        role="img"
        aria-label="Clock dial fan chart for astigmatism screening"
      />
    </div>
  )
}

function AstigmatismPrecisionTest({ onExit, onSaveResult }) {
  const initialCalibration = useMemo(() => loadCalibration(), [])
  const [rectWidthPx, setRectWidthPx] = useState(() => {
    if (initialCalibration?.pxPerMm) return initialCalibration.pxPerMm * CARD_WIDTH_MM
    return DEFAULT_RECT_WIDTH
  })
  const [savedCalibration, setSavedCalibration] = useState(initialCalibration)
  const [selectedAngles, setSelectedAngles] = useState([])
  const [reportHistory, setReportHistory] = useState([])

  const pxPerMm = useMemo(() => getPxPerMm(savedCalibration), [savedCalibration])
  const selectedAxis = useMemo(() => averageAxialAngles(selectedAngles), [selectedAngles])
  const detectedAxis = selectedAxis

  const toggleAngle = (angle) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((item) => item !== angle) : [...prev, angle].sort((a, b) => a - b),
    )
  }

  const handleSaveCalibration = () => {
    const calibration = saveCalibration(rectWidthPx)
    setSavedCalibration(calibration)
  }

  const buildReport = () => {
    const report = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      selectedAngles,
      selectedAxis,
      detectedAxis,
    }

    setReportHistory((prev) => [report, ...prev].slice(0, 5))
    if (onSaveResult && typeof detectedAxis === 'number') {
      onSaveResult(report)
    }
  }

  return (
    <div className="astig-suite">
      <div className="astig-topbar">
        <div>
          <h3>Astigmatism Test</h3>
          <p className="astig-topbar-copy">Use the chart below and tap the lines that look darkest or clearest.</p>
        </div>
        <button className="exit-btn" onClick={onExit}>Exit Test</button>
      </div>

      <div className="astig-grid">
        <section className="astig-card glass-card">
          <div className="astig-section-head">
            <h4>Instructions</h4>
            <p>Check one eye at a time with a simple clock-dial chart.</p>
          </div>
          <div className="astig-instructions">
            <div className="astig-step">
              <span className="astig-step-num">1</span>
              <div>
                <strong>Sit at a fixed distance</strong>
                <p>Use about 1 meter whenever possible and keep the screen centered.</p>
              </div>
            </div>
            <div className="astig-step">
              <span className="astig-step-num">2</span>
              <div>
                <strong>Cover one eye</strong>
                <p>Keep the other eye relaxed, then stare only at the fixation dot.</p>
              </div>
            </div>
            <div className="astig-step">
              <span className="astig-step-num">3</span>
              <div>
                <strong>Select the clearest lines</strong>
                <p>Tap the lines that look darkest, sharpest, or easiest to see.</p>
              </div>
            </div>
          </div>

          <Calibration
            rectWidthPx={rectWidthPx}
            onRectWidthChange={setRectWidthPx}
            onSave={handleSaveCalibration}
            pxPerMm={pxPerMm}
          />
        </section>

        <section className="astig-card glass-card">
          <div className="astig-section-head">
            <h4>Clock Dial Chart</h4>
            <p>Tap any line label or tap near a line on the chart to mark it.</p>
          </div>

          <ClockDialCanvas pxPerMm={pxPerMm} selectedAngles={selectedAngles} onToggleAngle={toggleAngle} />

          <div className="astig-angle-list" aria-label="Selectable line angles">
            {ANGLES.map((angle) => (
              <button
                key={angle}
                className={`astig-angle-chip ${selectedAngles.includes(angle) ? 'selected' : ''}`}
                onClick={() => toggleAngle(angle)}
              >
                {angleLabel(angle)}
              </button>
            ))}
          </div>

          <div className="astig-result-strip">
            <div>
              <span className="astig-label">Selected lines</span>
              <strong>{selectedAngles.length ? selectedAngles.map(angleLabel).join(', ') : 'None yet'}</strong>
            </div>
            <div>
              <span className="astig-label">Approx axis</span>
              <strong>{typeof selectedAxis === 'number' ? angleLabel(selectedAxis) : '--'}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="astig-card glass-card">
        <div className="astig-section-head">
          <h4>Report</h4>
          <p>Your result is estimated from the lines you selected on the chart.</p>
        </div>

        <div className="astig-report-grid astig-report-grid-single">
          <div className="astig-report-box highlight">
            <span className="astig-label">Approx detected axis</span>
            <strong>{typeof detectedAxis === 'number' ? angleLabel(detectedAxis) : 'Select lines first'}</strong>
          </div>
        </div>

        <div className="astig-report-actions">
          <button className="btn-primary glow-btn" onClick={buildReport}>Generate Report</button>
          <button
            className="btn-secondary"
            onClick={() => {
              setSelectedAngles([])
            }}
          >
            Reset Responses
          </button>
        </div>

        {reportHistory.length > 0 && (
          <div className="astig-history">
            {reportHistory.map((report) => (
              <div key={report.id} className="astig-history-item">
                <div className="astig-history-row">
                  <span>Generated</span>
                  <strong>{report.timestamp}</strong>
                </div>
                <div className="astig-history-row">
                  <span>Lines</span>
                  <strong>{report.selectedAngles.length ? report.selectedAngles.map(angleLabel).join(', ') : 'None'}</strong>
                </div>
                <div className="astig-history-row">
                  <span>Approx axis</span>
                  <strong>{typeof report.detectedAxis === 'number' ? angleLabel(report.detectedAxis) : '--'}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="astig-disclaimer">
          Disclaimer: this is a screening tool only and does not provide a medical diagnosis. Clinical evaluation by an eye-care professional is required for diagnosis and treatment.
        </p>
      </section>
    </div>
  )
}

export default AstigmatismPrecisionTest
