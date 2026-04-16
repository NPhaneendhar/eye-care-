import { useMemo, useState } from 'react'
import SnellenOptotype from './SnellenOptotype'
import {
  FALLBACK_PX_PER_MM,
  getPxPerMm,
  loadCalibration,
  mmToPx,
} from '../utils/measurement'

const ACUITY_LEVELS = [
  { ratio: '6/60', mm: 87.3 },
  { ratio: '6/36', mm: 52.4 },
  { ratio: '6/24', mm: 34.9 },
  { ratio: '6/18', mm: 26.2 },
  { ratio: '6/12', mm: 17.5 },
  { ratio: '6/9', mm: 13.1 },
  { ratio: '6/6', mm: 8.7 },
]

function SnellenLab({ onExit, onComplete }) {
  const initialCalibration = useMemo(() => loadCalibration(), [])
  const [savedCalibration] = useState(initialCalibration)
  const [acuityIndex, setAcuityIndex] = useState(6)
  const [letter] = useState('E')

  const target = ACUITY_LEVELS[acuityIndex]
  const pxPerMm = useMemo(
    () => getPxPerMm(savedCalibration) || FALLBACK_PX_PER_MM,
    [savedCalibration],
  )
  const letterPx = useMemo(() => mmToPx(target.mm, pxPerMm), [target.mm, pxPerMm])

  const changeAcuity = (nextIndex) => setAcuityIndex(nextIndex)

  return (
    <div className="snellen-lab-shell">
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
        </section>
      </main>

      <section className="snellen-lab-dock glass-heavy">
        <div className="snellen-lab-card snellen-lab-card-wide">

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

        <button
          type="button"
          className="btn-primary glow-btn snellen-save-btn"
          onClick={() => onComplete?.({ ratio: target.ratio, sizeMm: target.mm, letter })}
        >
          Save Acuity Result
        </button>
      </section>
    </div>
  )
}

export default SnellenLab
