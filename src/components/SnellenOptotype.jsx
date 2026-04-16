const MAPS = {
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  P: ['11110', '10010', '11110', '10000', '10000'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
}

const GRID_UNITS = 5
const CELL_SIZE = 100 / GRID_UNITS

function SnellenOptotype({ letter, sizePx }) {
  const displayLetter = MAPS[letter] ? letter : 'E'
  const rows = MAPS[displayLetter]

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Optotype ${displayLetter}`}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      <rect x="0" y="0" width="100" height="100" fill="#fffdf7" />
      {rows.flatMap((row, rowIndex) =>
        row.split('').map((cell, columnIndex) =>
          cell === '1' ? (
            <rect
              key={`${displayLetter}-${rowIndex}-${columnIndex}`}
              x={columnIndex * CELL_SIZE}
              y={rowIndex * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill="#111111"
            />
          ) : null,
        ),
      )}
    </svg>
  )
}

export default SnellenOptotype
