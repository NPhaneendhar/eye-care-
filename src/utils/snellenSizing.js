import {
  FALLBACK_PX_PER_MM,
  getPxPerMm as getCalibratedPxPerMm,
  loadCalibration,
  mmToPx as measurementMmToPx,
} from './measurement'

export const getPxPerMm = () => getCalibratedPxPerMm(loadCalibration()) || FALLBACK_PX_PER_MM

export const mmToPx = (mm, pxPerMm = getPxPerMm()) => measurementMmToPx(mm, pxPerMm)
