const FALLBACK_PX_PER_MM = 3.7795275591
const CALIBRATION_KEYS = ['snellenCalibrationV1', 'pxPerMm', 'snellenPxPerMm']

const parsePxPerMm = (raw) => {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'number' && parsed > 0) return parsed
    if (parsed && typeof parsed.pxPerMm === 'number' && parsed.pxPerMm > 0) return parsed.pxPerMm
    return null
  } catch {
    const asNumber = Number(raw)
    return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null
  }
}

export const getPxPerMm = () => {
  if (typeof window === 'undefined') return FALLBACK_PX_PER_MM

  for (const key of CALIBRATION_KEYS) {
    const value = parsePxPerMm(window.localStorage.getItem(key))
    if (value) return value
  }

  return FALLBACK_PX_PER_MM
}

export const mmToPx = (mm, pxPerMm = getPxPerMm()) => mm * pxPerMm
