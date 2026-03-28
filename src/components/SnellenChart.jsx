import SnellenRow from './SnellenRow'
import { mmToPx } from '../utils/snellenSizing'

function SnellenChart({ rows, pxPerMm }) {
  const rowGapPx = mmToPx(6, pxPerMm)
  const letterGapPx = mmToPx(3, pxPerMm)

  return (
    <div
      style={{
        background: '#ffffff',
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${rowGapPx}px`,
          transform: 'none',
        }}
      >
        {rows.map((row) => (
          <SnellenRow key={row.ratio} row={row} pxPerMm={pxPerMm} letterGapPx={letterGapPx} />
        ))}
      </div>
    </div>
  )
}

export default SnellenChart
