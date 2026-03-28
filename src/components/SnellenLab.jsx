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

function SnellenLab({ onExit, onComplete, eyeLabel = 'Right Eye' }) {
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
        background: 'linear-gradient(180deg, #d8ecff 0%, #eef8ff 46%, #fff5df 100%)',
        zIndex: 5000,
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      <main
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top, rgba(255,255,255,0.94), rgba(242,248,255,0.98) 55%, rgba(255,246,224,0.95) 100%)',
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
            background: 'rgba(8, 34, 60, 0.9)',
            color: '#f8fbff',
            borderRadius: '16px',
            padding: '10px 12px',
            fontSize: '12px',
            lineHeight: 1.35,
            boxShadow: '0 18px 36px rgba(8, 34, 60, 0.18)',
          }}
        >
          <div style={{ fontWeight: 700 }}>EyeCare Pro Vision Test</div>
          <div>Acuity: {target.ratio} | Size: {target.mm.toFixed(1)} mm</div>
          <div>{eyeLabel} | Test Distance: {distancePreset}</div>
        </div>

        <button
          type="button"
          onClick={onExit}
          style={{
            background: '#ffffff',
            color: '#0f2945',
            border: '1px solid #b8d4ea',
            borderRadius: '12px',
            padding: '10px 14px',
            fontWeight: 700,
            cursor: 'pointer',
            height: 'fit-content',
            boxShadow: '0 10px 24px rgba(15, 41, 69, 0.12)',
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
            background: '#fff6dd',
            border: '1px solid #f7c96c',
            color: '#8f4b00',
            borderRadius: '14px',
            padding: '10px 12px',
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
          background: 'linear-gradient(180deg, rgba(10, 35, 60, 0.97), rgba(14, 54, 87, 0.98))',
          color: '#eef8ff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid rgba(255,255,255,0.16)',
          padding: '12px 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px',
          display: 'grid',
          gap: '10px',
          boxShadow: '0 -24px 54px rgba(4, 16, 28, 0.24)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={prevSize}
            style={{ background: '#f4fbff', color: '#0e3558', border: '1px solid #cbe4f4', padding: '11px', borderRadius: '12px', fontWeight: 700 }}
          >
            Larger
          </button>
          <button
            type="button"
            onClick={nextSize}
            style={{ background: '#f4fbff', color: '#0e3558', border: '1px solid #cbe4f4', padding: '11px', borderRadius: '12px', fontWeight: 700 }}
          >
            Smaller
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={randomizeLetter}
            style={{ background: 'rgba(255,255,255,0.16)', color: '#f8fbff', border: '1px solid rgba(255,255,255,0.14)', padding: '10px', borderRadius: '12px', fontWeight: 700 }}
          >
            Random
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{ background: 'rgba(255,255,255,0.16)', color: '#f8fbff', border: '1px solid rgba(255,255,255,0.14)', padding: '10px', borderRadius: '12px', fontWeight: 700 }}
          >
            Fullscreen
          </button>
          <select
            value={distancePreset}
            onChange={(e) => setDistancePreset(e.target.value)}
            style={{ background: '#fffdf8', color: '#0f2945', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 700 }}
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
            <div style={{ width: `${tenMmPx}px`, height: `${tenMmPx}px`, border: '1px solid #ffffff', boxSizing: 'border-box', marginLeft: 'auto', borderRadius: '4px' }} />
            <div style={{ marginTop: '3px' }}>10 mm</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onComplete?.({ ratio: target.ratio, sizeMm: target.mm, distance: distancePreset, letter })}
          style={{
            background: 'linear-gradient(135deg, #ffd48d, #8fe7ff)',
            color: '#0b2742',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 700,
          }}
        >
          Save Acuity Result
        </button>
      </section>
    </div>
  )
}

export default SnellenLab
