import { useEffect, useMemo, useState } from 'react'
import SnellenOptotype from './SnellenOptotype'
import { getPxPerMm, mmToPx } from '../utils/snellenSizing'

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

function SnellenLab({ onExit }) {
  const [pxPerMm] = useState(() => getPxPerMm())
  const [acuityIndex, setAcuityIndex] = useState(6)
  const [letter, setLetter] = useState('E')
  const [distancePreset, setDistancePreset] = useState(DISTANCE_PRESETS[1])
  const [isLandscape, setIsLandscape] = useState(false)

  const target = ACUITY_LEVELS[acuityIndex]
  const letterPx = useMemo(() => mmToPx(target.mm, pxPerMm), [target.mm, pxPerMm])
  const tenMmPx = useMemo(() => mmToPx(10, pxPerMm), [pxPerMm])

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  const randomizeLetter = () => {
    const next = LETTER_SET[Math.floor(Math.random() * LETTER_SET.length)]
    setLetter(next)
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#e2e8f0',
        zIndex: 5000,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <main
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          paddingBottom: '240px',
          boxSizing: 'border-box',
        }}
      >
        <SnellenOptotype letter={letter} sizePx={letterPx} />
      </main>

      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            background: 'rgba(15,23,42,0.95)',
            color: '#f8fafc',
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '12px',
            lineHeight: 1.35,
          }}
        >
          <div style={{ fontWeight: 700 }}>Super EyeCare Mobile Clinical Mode</div>
          <div>Acuity: {target.ratio} | Size: {target.mm.toFixed(1)} mm</div>
          <div>Test Distance: {distancePreset}</div>
        </div>

        <button
          type="button"
          onClick={onExit}
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #94a3b8',
            borderRadius: '8px',
            padding: '8px 12px',
            fontWeight: 700,
            cursor: 'pointer',
            height: 'fit-content',
          }}
        >
          Exit
        </button>
      </div>

      {isLandscape && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: '10px',
            right: '10px',
            background: '#fff7ed',
            border: '1px solid #fdba74',
            color: '#9a3412',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          Rotate to portrait for standardized mobile screening.
        </div>
      )}

      <section
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0f172a',
          color: '#e2e8f0',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          borderTop: '1px solid #334155',
          padding: '12px 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px',
          display: 'grid',
          gap: '10px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={prevSize}
            style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', padding: '10px', borderRadius: '8px', fontWeight: 700 }}
          >
            Larger
          </button>
          <button
            type="button"
            onClick={nextSize}
            style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', padding: '10px', borderRadius: '8px', fontWeight: 700 }}
          >
            Smaller
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={randomizeLetter}
            style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700 }}
          >
            Random
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700 }}
          >
            Fullscreen
          </button>
          <select
            value={distancePreset}
            onChange={(e) => setDistancePreset(e.target.value)}
            style={{ background: '#f8fafc', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700 }}
          >
            {DISTANCE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
            <div>pxPerMm: {pxPerMm.toFixed(6)}</div>
            <div>Letter: {letter} | {target.ratio}</div>
            <div>{target.mm.toFixed(1)} mm = {letterPx.toFixed(2)} px</div>
          </div>
          <div style={{ justifySelf: 'end', textAlign: 'center', fontSize: '11px' }}>
            <div style={{ width: `${tenMmPx}px`, height: `${tenMmPx}px`, border: '1px solid #ffffff', boxSizing: 'border-box', marginLeft: 'auto' }} />
            <div style={{ marginTop: '3px' }}>10 mm</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SnellenLab
