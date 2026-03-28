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
  const displayLetter = rows ? letter : 'E'

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Optotype ${letter}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      <rect x="3" y="3" width="94" height="94" rx="18" fill="#fffdf7" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="76"
        fontWeight="700"
        letterSpacing="-2"
        fill="#111111"
      >
        {displayLetter}
      </text>
    </svg>
  )
}

export default SnellenOptotype
