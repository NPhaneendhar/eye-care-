import { useState } from 'react'

const PLATES = [
  { id: 1, expected: ['26'], type: 'Vanishing' },
  { id: 2, expected: ['6'], type: 'Vanishing' },
  { id: 3, expected: ['13'], type: 'Vanishing' },
  { id: 4, expected: ['8'], type: 'Vanishing' },
  { id: 5, expected: ['45'], type: 'Vanishing' },
  { id: 6, expected: ['7'], type: 'Vanishing' },
  { id: 7, expected: ['16'], type: 'Vanishing' },
  { id: 8, expected: ['5'], type: 'Vanishing' },
  { id: 9, expected: ['15'], type: 'Vanishing' },
  { id: 10, expected: ['29'], type: 'Vanishing' },
  { id: 11, expected: ['12'], type: 'Control' },
  { id: 12, expected: ['8'], type: 'Vanishing' },
]

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, '')

function IshiharaLab({ onExit, onComplete }) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [responses, setResponses] = useState([])
  const [imgOk, setImgOk] = useState(false)

  const plate = PLATES[index]
  const imgSrc = `${import.meta.env.BASE_URL}ishihara/image${plate.id}.png?v=20260328-image-set`

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

    if (index < PLATES.length - 1) {
      setResponses(next)
      setIndex((prev) => prev + 1)
      setAnswer('')
      setImgOk(false)
      return
    }

    const correctCount = next.filter((item) => item.correct).length
    const pct = Math.round((correctCount / PLATES.length) * 100)
    const label = pct >= 84 ? 'Normal' : pct >= 60 ? 'Borderline' : 'Refer'

    onComplete({
      total: PLATES.length,
      correct: correctCount,
      pct,
      label,
      responses: next,
    })
  }

  return (
    <div style={{ minHeight: '70vh', display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#111827' }}>Ishihara Quick Color Test</h3>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Plate {index + 1}/{PLATES.length} | Type: {plate.type}
          </div>
        </div>
        <button className="glass-btn" onClick={onExit}>Exit</button>
      </div>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '12px 14px',
          color: '#334155',
          fontSize: '12px',
          lineHeight: 1.5,
        }}
      >
        Quick check sequence on this website:
        <strong style={{ color: '#0f172a' }}> 26, 6, 13, 8, 45, 7, 16, 5, 15, 29, 12, 8</strong>
      </div>

      <div style={{ display: 'grid', placeItems: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ width: 'min(78vw, 320px)', aspectRatio: '1 / 1' }}>
          <img
            src={imgSrc}
            alt={`Ishihara plate ${plate.id}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', display: imgOk ? 'block' : 'none' }}
            onLoad={() => setImgOk(true)}
            onError={() => setImgOk(false)}
          />

          {!imgOk && (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed #94a3b8', display: 'grid', placeItems: 'center', padding: '24px', color: '#475569', textAlign: 'center', fontSize: '12px' }}>
              Plate image missing:
              <br />
              <strong style={{ marginTop: '6px', display: 'block' }}>public/ishihara/image{plate.id}.png</strong>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter number you see"
          inputMode="numeric"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '16px',
            background: '#ffffff',
            color: '#111827',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-fail" onClick={() => commit(true)}>Skip</button>
          <button className="btn-pass" onClick={() => commit(false)} disabled={!answer.trim()}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default IshiharaLab
