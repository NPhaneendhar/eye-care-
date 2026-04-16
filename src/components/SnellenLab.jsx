import { useEffect, useMemo, useState } from 'react'
import SnellenOptotype from './SnellenOptotype'
import {
  CARD_WIDTH_MM,
  FALLBACK_PX_PER_MM,
  getPxPerMm,
  loadCalibration,
  mmToPx,
  saveCalibration,
} from '../utils/measurement'

const LETTER_SET = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C']

const ACUITY_LEVELS = [
  { ratio: '6/60', mm: 87.3 },
  { ratio: '6/36', mm: 52.4 },
  { ratio: '6/24', mm: 34.9 },
  { ratio: '6/18', mm: 26.2 },
  { ratio: '6/12', mm: 17.5 },
  { ratio: '6/9', mm: 13.1 },
  { ratio: '6/6', mm: 8.7 },
]

const DISTANCE_PRESETS = ['30 cm', '40 cm (recommended)', '50 cm']
const DEFAULT_RECT_WIDTH = CARD_WIDTH_MM * FALLBACK_PX_PER_MM

function SnellenLab({ onExit, onComplete, eyeLabel = 'Right Eye' }) {
  const initialCalibration = useMemo(() => loadCalibration(), [])
  const [savedCalibration, setSavedCalibration] = useState(initialCalibration)
  const [rectWidthPx, setRectWidthPx] = useState(() => {
    if (initialCalibration?.pxPerMm) return initialCalibration.pxPerMm * CARD_WIDTH_MM
    return DEFAULT_RECT_WIDTH
  })
  const [acuityIndex, setAcuityIndex] = useState(6)
  const [letter, setLetter] = useState('E')
  const [distancePreset, setDistancePreset] = useState(DISTANCE_PRESETS[1])
  const [isLandscape, setIsLandscape] = useState(false)
  const [showCalibration, setShowCalibration] = useState(() => !initialCalibration?.pxPerMm)
  const [viewportSignature, setViewportSignature] = useState('')

  const target = ACUITY_LEVELS[acuityIndex]
  const calibrationActive = Boolean(savedCalibration?.pxPerMm)
  const pxPerMm = useMemo(
    () => getPxPerMm(savedCalibration) || FALLBACK_PX_PER_MM,
    [savedCalibration, viewportSignature],
  )
  const letterPx = useMemo(() => mmToPx(target.mm, pxPerMm), [target.mm, pxPerMm])
  const tenMmPx = useMemo(() => mmToPx(10, pxPerMm), [pxPerMm])

  useEffect(() => {
    const checkViewport = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
      setViewportSignature(
        `${window.innerWidth}x${window.innerHeight}:${window.devicePixelRatio || 1}:${window.visualViewport?.scale || 1}`,
      )
    }

    const viewport = window.visualViewport

    checkViewport()
    window.addEventListener('resize', checkViewport)
    window.addEventListener('orientationchange', checkViewport)
    viewport?.addEventListener('resize', checkViewport)

    return () => {
      window.removeEventListener('resize', checkViewport)
      window.removeEventListener('orientationchange', checkViewport)
      viewport?.removeEventListener('resize', checkViewport)
    }
  }, [])

  const randomizeLetter = () => {
    const next = LETTER_SET[Math.floor(Math.random() * LETTER_SET.length)]
    setLetter(next)
  }

  const changeAcuity = (nextIndex) => {
    setAcuityIndex(nextIndex)
  }

  const nextSize = () => {
    setAcuityIndex((prev) => Math.min(ACUITY_LEVELS.length - 1, prev + 1))
    randomizeLetter()
  }

  const prevSize = () => {
    setAcuityIndex((prev) => Math.max(0, prev - 1))
    randomizeLetter()
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }
    await document.exitFullscreen()
  }

  const handleSaveCalibration = () => {
    const calibration = saveCalibration(rectWidthPx)
    setSavedCalibration(calibration)
    setShowCalibration(false)
  }

  const toggleCalibrationPanel = () => {
    setShowCalibration((previous) => {
      const next = !previous
      if (next && savedCalibration?.pxPerMm) {
        setRectWidthPx(pxPerMm * CARD_WIDTH_MM)
      }
      return next
    })
  }

  return (
    <div className="snellen-lab-shell">
      <header className="snellen-lab-header glass-heavy animate-slide-down">
        <div className="snellen-lab-header-copy">
          <span className="feedback-pill snellen-lab-kicker-pill">Acuity Lab</span>
          <h2 className="premium-glow-text">Precision Optotype Studio</h2>
          <p>Calibrated single-letter screening built to preserve the exact millimeter targets on phone and desktop.</p>
        </div>

        <div className="snellen-lab-header-meta">
          <div className="snellen-lab-meta-chip">
            <span>Eye</span>
            <strong>{eyeLabel}</strong>
          </div>
          <div className="snellen-lab-meta-chip">
            <span>Distance</span>
            <strong>{distancePreset}</strong>
          </div>
          <div className="snellen-lab-meta-chip">
            <span>Status</span>
            <strong>{calibrationActive ? 'Calibrated' : 'Fallback'}</strong>
          </div>
          <button type="button" className="btn-secondary snellen-lab-exit-btn" onClick={onExit}>
            Exit Test
          </button>
        </div>
      </header>

      {isLandscape && (
        <div className="snellen-lab-alert">
          Rotate to portrait for standardized mobile screening and easier physical-size matching.
        </div>
      )}

      <main className="snellen-lab-stage-wrap">
        <section className="snellen-lab-stage">
          <div className="snellen-stage-head">
            <span className="snellen-stage-label">Current Target</span>
            <div className="snellen-stage-reading">
              <strong>{target.ratio}</strong>
              <span>{target.mm.toFixed(1)} mm optotype height</span>
            </div>
          </div>

          <div className="snellen-optotype-shell">
            <div className="snellen-optotype-caption">{target.mm.toFixed(1)} mm</div>
            <SnellenOptotype letter={letter} sizePx={letterPx} />
          </div>

          <div className="snellen-stage-footer">
            <span className={`status-badge ${calibrationActive ? 'active' : 'idle'} snellen-stage-badge`}>
              {calibrationActive ? 'Exact size locked' : 'Browser fallback active'}
            </span>
            <div className="snellen-stage-footer-meta">
              <span>Optotype</span>
              <strong>{letter}</strong>
            </div>
          </div>
        </section>
      </main>

      <section className="snellen-lab-dock glass-heavy">
        <div className="snellen-lab-dock-grid">
          <div className="snellen-lab-card snellen-lab-card-wide">
            <div className="snellen-lab-card-head">
              <div>
                <span className="snellen-lab-card-kicker">Size Ladder</span>
                <h3>Select the exact acuity size</h3>
              </div>
              <button type="button" className="btn-secondary snellen-inline-action" onClick={toggleCalibrationPanel}>
                {showCalibration ? 'Hide Calibration' : 'Calibrate Size'}
              </button>
            </div>

            <div className="snellen-size-strip" aria-label="Acuity size selection">
              {ACUITY_LEVELS.map((level, index) => (
                <button
                  key={level.ratio}
                  type="button"
                  className={`snellen-size-chip ${index === acuityIndex ? 'active' : ''}`}
                  onClick={() => changeAcuity(index)}
                >
                  <span>{level.ratio}</span>
                  <strong>{level.mm.toFixed(1)} mm</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="snellen-lab-card">
            <div className="snellen-lab-card-head">
              <div>
                <span className="snellen-lab-card-kicker">Controls</span>
                <h3>Move through the test quickly</h3>
              </div>
            </div>

            <div className="snellen-action-grid">
              <button type="button" className="btn-secondary snellen-tool-btn" onClick={prevSize}>
                Larger
              </button>
              <button type="button" className="btn-secondary snellen-tool-btn" onClick={nextSize}>
                Smaller
              </button>
              <button type="button" className="btn-secondary snellen-tool-btn" onClick={randomizeLetter}>
                Random Letter
              </button>
              <button type="button" className="btn-secondary snellen-tool-btn" onClick={toggleFullscreen}>
                Fullscreen
              </button>
            </div>

            <label className="snellen-select-wrap">
              <span>Viewing distance</span>
              <select
                value={distancePreset}
                className="snellen-lab-select"
                onChange={(event) => setDistancePreset(event.target.value)}
              >
                {DISTANCE_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="snellen-lab-card">
            <div className="snellen-lab-card-head">
              <div>
                <span className="snellen-lab-card-kicker">Telemetry</span>
                <h3>Live sizing readout</h3>
              </div>
            </div>

            <div className="snellen-telemetry-grid">
              <div className="snellen-telemetry-tile">
                <span>px per mm</span>
                <strong>{pxPerMm.toFixed(4)}</strong>
              </div>
              <div className="snellen-telemetry-tile">
                <span>Letter</span>
                <strong>
                  {letter} | {target.ratio}
                </strong>
              </div>
              <div className="snellen-telemetry-tile">
                <span>Pixel height</span>
                <strong>{letterPx.toFixed(2)} px</strong>
              </div>
              <div className="snellen-telemetry-tile">
                <span>Calibration</span>
                <strong>{calibrationActive ? 'Saved' : 'Fallback'}</strong>
              </div>
            </div>

            <div className="snellen-reference-card">
              <div>
                <span>10 mm reference</span>
                <strong>Use this to sanity-check scale</strong>
              </div>
              <div className="snellen-reference-visual">
                <div
                  className="snellen-reference-square"
                  style={{ width: `${tenMmPx}px`, height: `${tenMmPx}px` }}
                />
                <small>10 mm</small>
              </div>
            </div>
          </div>
        </div>

        {showCalibration && (
          <div className="snellen-lab-card snellen-calibration-card animate-fade-in">
            <div className="snellen-lab-card-head">
              <div>
                <span className="snellen-lab-card-kicker">Physical Calibration</span>
                <h3>Match the screen to a real card</h3>
              </div>
              <span className={`status-badge ${calibrationActive ? 'active' : 'idle'}`}>
                {calibrationActive ? 'Saved profile loaded' : 'Not saved yet'}
              </span>
            </div>

            <p className="snellen-calibration-copy">
              Resize the green bar until it matches a credit or debit card width ({CARD_WIDTH_MM} mm), then save.
              That keeps every listed size, including 87.3 mm, true to its intended physical height on this device.
            </p>

            <div className="snellen-calibration-preview">
              <div className="snellen-calibration-bar" style={{ width: `${rectWidthPx}px` }}>
                85.6 mm card reference
              </div>
            </div>

            <input
              className="snellen-calibration-slider"
              type="range"
              min="120"
              max="900"
              step="1"
              value={Math.round(rectWidthPx)}
              onChange={(event) => setRectWidthPx(Number(event.target.value))}
            />

            <div className="snellen-calibration-stats">
              <div className="snellen-telemetry-tile">
                <span>Reference width</span>
                <strong>{rectWidthPx.toFixed(1)} px</strong>
              </div>
              <div className="snellen-telemetry-tile">
                <span>Preview scale</span>
                <strong>{(rectWidthPx / CARD_WIDTH_MM).toFixed(4)} px/mm</strong>
              </div>
              <div className="snellen-telemetry-tile">
                <span>Target status</span>
                <strong>{calibrationActive ? 'Ready to refine' : 'Ready to save'}</strong>
              </div>
            </div>

            <button type="button" className="btn-primary glow-btn snellen-calibration-save" onClick={handleSaveCalibration}>
              Save Calibration
            </button>
          </div>
        )}

        <button
          type="button"
          className="btn-primary glow-btn snellen-save-btn"
          onClick={() => onComplete?.({ ratio: target.ratio, sizeMm: target.mm, distance: distancePreset, letter })}
        >
          Save Acuity Result
        </button>
      </section>
    </div>
  )
}

export default SnellenLab
