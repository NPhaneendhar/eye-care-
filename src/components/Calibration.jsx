import { CARD_WIDTH_MM } from '../utils/measurement'

function Calibration({ rectWidthPx, onRectWidthChange, onSave, pxPerMm }) {
  return (
    <div className="forensic-panel">
      <h4>Card Calibration</h4>
      <p className="forensic-help">
        Resize the green rectangle until it matches a credit/debit card width ({CARD_WIDTH_MM} mm).
      </p>
      <div className="calibration-wrap">
        <div className="calibration-rect" style={{ width: `${rectWidthPx}px` }}>
          <span>85.6 mm reference</span>
        </div>
      </div>

      <input
        className="calibration-slider"
        type="range"
        min="120"
        max="900"
        step="1"
        value={Math.round(rectWidthPx)}
        onChange={(e) => onRectWidthChange(Number(e.target.value))}
      />

      <div className="forensic-row">
        <span>Rectangle</span>
        <strong>{rectWidthPx.toFixed(1)} px</strong>
      </div>
      <div className="forensic-row">
        <span>Current pxPerMm</span>
        <strong>{pxPerMm ? pxPerMm.toFixed(4) : '--'}</strong>
      </div>

      <button className="forensic-btn" onClick={onSave}>Save Calibration</button>
    </div>
  )
}

export default Calibration
