import SnellenOptotype from './SnellenOptotype'
import { mmToPx } from '../utils/snellenSizing'

function SnellenRow({ row, pxPerMm, letterGapPx }) {
  const sizePx = mmToPx(row.mm, pxPerMm)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${letterGapPx}px`,
        width: 'auto',
        height: `${sizePx}px`,
        minHeight: `${sizePx}px`,
        maxHeight: `${sizePx}px`,
        flex: '0 0 auto',
      }}
      aria-label={`Snellen row ${row.ratio}`}
    >
      {row.letters.map((letter, index) => (
        <SnellenOptotype key={`${row.ratio}-${index}-${letter}`} letter={letter} sizePx={sizePx} />
      ))}
    </div>
  )
}

export default SnellenRow
