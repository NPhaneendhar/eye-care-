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

function SnellenOptotype({ letter, sizePx }) {
  const rows = MAPS[letter] || MAPS.E

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 5 5"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Optotype ${letter}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      {rows.flatMap((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? <rect key={`${letter}-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000000" /> : null,
        ),
      )}
    </svg>
  )
}

export default SnellenOptotype
