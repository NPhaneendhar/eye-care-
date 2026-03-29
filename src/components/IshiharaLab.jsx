import { useMemo, useState } from 'react'

const PLATES = [
  { id: 1, expected: ['26'] },
  { id: 2, expected: ['6'] },
  { id: 3, expected: ['13'] },
  { id: 4, expected: ['8'] },
  { id: 5, expected: ['45'] },
  { id: 6, expected: ['7'] },
  { id: 7, expected: ['16'] },
  { id: 8, expected: ['5'] },
  { id: 9, expected: ['15'] },
  { id: 10, expected: ['29'] },
  { id: 11, expected: ['12'] },
  { id: 12, expected: ['8'] },
]

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, '')

const shufflePlates = (plates) => {
  const next = [...plates]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[randomIndex]] = [next[randomIndex], next[index]]
  }

  return next
}

function IshiharaLab({ onExit, onComplete }) {
  const orderedPlates = useMemo(() => shufflePlates(PLATES), [])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [responses, setResponses] = useState([])
  const [imgOk, setImgOk] = useState(false)

  const plate = orderedPlates[index]
  const imgSrc = `${import.meta.env.BASE_URL}ishihara/image${plate.id}.png?v=20260329-shuffle`
  const progressPct = Math.round(((index + 1) / orderedPlates.length) * 100)

  const commit = (isSkip = false) => {
    const typed = isSkip ? '' : answer
    const typedNorm = normalize(typed)
    const isCorrect = plate.expected.some((exp) => normalize(exp) === typedNorm)

    const next = [
      ...responses,
      {
        plateId: plate.id,
        expected: plate.expected.join('/'),
        typed,
        correct: isCorrect,
      },
    ]

    if (index < orderedPlates.length - 1) {
      setResponses(next)
      setIndex((prev) => prev + 1)
      setAnswer('')
      setImgOk(false)
      return
    }

    const correctCount = next.filter((item) => item.correct).length
    const pct = Math.round((correctCount / orderedPlates.length) * 100)
    const label = pct >= 84 ? 'Normal' : pct >= 60 ? 'Borderline' : 'Refer'

    onComplete({
      total: orderedPlates.length,
      correct: correctCount,
      pct,
      label,
      responses: next,
    })
  }

  return (
    <div className="ishihara-lab">
      <div className="ishihara-topbar">
        <div className="ishihara-heading">
          <span className="lab-kicker">Color Vision Screen</span>
          <h3>Ishihara Screening</h3>
          <p>Each session now uses a fresh randomized plate order for a cleaner test flow.</p>
        </div>
        <button className="exit-btn" onClick={onExit}>Exit Test</button>
      </div>

      <section className="ishihara-card glass-card">
        <div className="ishihara-status-row">
          <div className="ishihara-progress-copy">
            <span className="ishihara-status-label">Plate Progress</span>
            <strong>{index + 1} / {orderedPlates.length}</strong>
          </div>
          <div className="ishihara-progress-copy align-right">
            <span className="ishihara-status-label">Current Plate</span>
            <strong>Plate {plate.id}</strong>
          </div>
        </div>

        <div className="ishihara-progress-bar">
          <div className="ishihara-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="ishihara-stage">
          <div className="ishihara-plate-shell">
            <div className="ishihara-plate-frame">
              <img
                src={imgSrc}
                alt={`Ishihara plate ${plate.id}`}
                className="ishihara-plate-image"
                style={{ display: imgOk ? 'block' : 'none' }}
                onLoad={() => setImgOk(true)}
                onError={() => setImgOk(false)}
              />

              {!imgOk && (
                <div className="ishihara-plate-fallback">
                  <span>Plate image missing</span>
                  <strong>public/ishihara/image{plate.id}.png</strong>
                </div>
              )}
            </div>
          </div>

          <div className="ishihara-answer-panel">
            <div className="ishihara-prompt-card">
              <span className="ishihara-status-label">Question</span>
              <h4>What number do you see?</h4>
              <p>Type only the number visible inside the plate. If you cannot see one, press Skip.</p>
            </div>

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the number"
              inputMode="numeric"
              className="ishihara-input"
            />

            <div className="ishihara-action-row">
              <button className="btn-secondary ishihara-secondary-btn" onClick={() => commit(true)}>Skip</button>
              <button className="btn-primary glow-btn ishihara-primary-btn" onClick={() => commit(false)} disabled={!answer.trim()}>
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default IshiharaLab
