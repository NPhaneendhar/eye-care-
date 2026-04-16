export const CARD_WIDTH_MM = 85.6
export const SNELLEN_6_6_MM = 8.7
export const CALIBRATION_STORAGE_KEY = 'snellenCalibrationV1'
export const FALLBACK_PX_PER_MM = 3.7795275591

const getViewportScale = () => {
  if (typeof window === 'undefined') return 1
  return window.visualViewport?.scale || 1
}

const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

export const loadCalibration = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(CALIBRATION_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.pxPerMm !== 'number' || parsed.pxPerMm <= 0) return null
    return {
      pxPerMm: parsed.pxPerMm,
      calibratedDpr: parsed.calibratedDpr || 1,
      calibratedViewportScale: parsed.calibratedViewportScale || 1,
      timestamp: parsed.timestamp || Date.now(),
    }
  } catch {
    return null
  }
}

export const saveCalibration = (rectWidthPx) => {
  if (typeof window === 'undefined') return null
  const pxPerMm = rectWidthPx / CARD_WIDTH_MM
  const payload = {
    pxPerMm,
    calibratedDpr: getDevicePixelRatio(),
    calibratedViewportScale: getViewportScale(),
    timestamp: Date.now(),
  }

  window.localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(payload))
  return payload
}

export const getPxPerMm = (calibration) => {
  if (!calibration?.pxPerMm) return null

  const currentDpr = getDevicePixelRatio()
  const currentViewportScale = getViewportScale()

  const dprCompensation = (calibration.calibratedDpr || 1) / currentDpr
  const viewportCompensation = (calibration.calibratedViewportScale || 1) / currentViewportScale

  return calibration.pxPerMm * dprCompensation * viewportCompensation
}

export const mmToPx = (mm, pxPerMm) => {
  if (!pxPerMm || pxPerMm <= 0) return 0
  return mm * pxPerMm
}
