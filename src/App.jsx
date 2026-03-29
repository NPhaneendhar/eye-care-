import { useState, useEffect, useRef } from 'react'
import './App.css'
import SnellenLab from './components/SnellenLab'
import IshiharaLab from './components/IshiharaLab'
import AstigmatismPrecisionTest from './components/AstigmatismPrecisionTest'
import PatientSessionPanel from './components/PatientSessionPanel'
import ResultsDashboard from './components/ResultsDashboard'
import ToolReportSheet from './components/ToolReportSheet'
import { playClinicalTone } from './utils/sound'
import { openPatientPdfReport } from './utils/pdfReport'

const snellenLetters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C']

const getInstallEnvironment = () => {
  const ua = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const isSafari = /safari/.test(ua) && !/chrome|crios|edg|opr/.test(ua)
  const isDesktop = !isIos && !isAndroid
  const canShare = typeof navigator.share === 'function'
  const isSecure =
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  return {
    isAndroid,
    isDesktop,
    isIos,
    isSafari,
    canShare,
    isSecure,
  }
}

const getInstallInstructions = (env, canPrompt) => {
  if (!env.isSecure) {
    return [
      'Open this app from an HTTPS website. Install will not work from an insecure link.',
      'After opening the secure version, try Install App again in Chrome, Edge, or Safari.',
    ]
  }

  if (canPrompt) {
    return [
      'Press Install App below.',
      'Approve the browser popup to add EyeCare Pro to your device.',
    ]
  }

  if (env.isIos) {
    return [
      'Open this app in Safari.',
      'Tap Share and choose Add to Home Screen.',
      'Tap Add to install it like an app on your iPhone or iPad.',
    ]
  }

  if (env.isAndroid) {
    return [
      'Open this app in Chrome or Edge on Android.',
      'Tap the browser menu and choose Install app or Add to Home screen.',
      'If the option is missing, refresh once and wait a few seconds.',
    ]
  }

  return [
    'Open this app in Chrome or Edge on your computer.',
    'Use the install icon in the address bar or the browser menu and choose Install EyeCare Pro.',
    'If install does not appear, refresh the page once and try again.',
  ]
}

function App() {
  const baseUrl = import.meta.env.BASE_URL
  const [launcherDismissed, setLauncherDismissed] = useState(() => localStorage.getItem('launcherDismissed') === 'true')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentSection, setCurrentSection] = useState('home')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [reminderInterval, setReminderInterval] = useState(20)
  const [nextReminderTime, setNextReminderTime] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [showBreakGuide, setShowBreakGuide] = useState(false)
  const [breakSteps, setBreakSteps] = useState({ blink: false, lookAway: false, hydrate: false })
  
  // Persistent State
  const [breaksTaken, setBreaksTaken] = useState(() => Number(localStorage.getItem('breaksTaken')) || 0)
  const [healthScore, setHealthScore] = useState(() => {
    const saved = localStorage.getItem('healthScore')
    return saved !== null ? Number(saved) : 100
  })
  const [activityLogs, setActivityLogs] = useState(() => JSON.parse(localStorage.getItem('activityLogs')) || [])
  const [sessionHistory, setSessionHistory] = useState(() => JSON.parse(localStorage.getItem('patientSessions')) || [])
  const [sessionStartTime] = useState(Date.now())
  
  // Screening State
  const [screeningType, setScreeningType] = useState(null)
  const [patientName, setPatientName] = useState(() => localStorage.getItem('patientNameDraft') || '')
  const [selectedEye, setSelectedEye] = useState(() => localStorage.getItem('selectedEyeDraft') || 'Right Eye')
  const [activeSession, setActiveSession] = useState(() => JSON.parse(localStorage.getItem('activePatientSession')) || null)
  const [toolReport, setToolReport] = useState(null)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [installEnv, setInstallEnv] = useState(() => ({
    isAndroid: false,
    isDesktop: true,
    isIos: false,
    isSafari: false,
    canShare: false,
    isSecure: true,
  }))
  const [copiedInstallLink, setCopiedInstallLink] = useState(false)
  
  // Ishihara State
  const [ishiharaResult, setIshiharaResult] = useState(() => localStorage.getItem('ishiharaResult') || 'Neutral')
  const [acuityResult, setAcuityResult] = useState(() => localStorage.getItem('acuityResult') || '--')
  const [astigmatismAxis, setAstigmatismAxis] = useState(() => localStorage.getItem('astigmatismAxis') || '--')
  const [contrastResult, setContrastResult] = useState(() => localStorage.getItem('contrastResult') || '--')
  const [blinkRateResult, setBlinkRateResult] = useState(() => localStorage.getItem('blinkRateResult') || '--')

  // Contrast State
  const [contrastLevel, setContrastLevel] = useState(100)
  const [contrastStep, setContrastStep] = useState(0)
  const [contrastScore, setContrastScore] = useState(0)

  // Blink Tracker State
  const [blinkCount, setBlinkCount] = useState(0)
  const [isBlinkTracking, setIsBlinkTracking] = useState(false)
  const [blinkTimer, setBlinkTimer] = useState(0)
  const timerRef = useRef(null)

  // Core Sync & Score Calc
  useEffect(() => {
    localStorage.setItem('breaksTaken', breaksTaken.toString())
    localStorage.setItem('ishiharaResult', ishiharaResult)
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
    localStorage.setItem('healthScore', healthScore.toString())
    localStorage.setItem('patientSessions', JSON.stringify(sessionHistory))
    localStorage.setItem('patientNameDraft', patientName)
    localStorage.setItem('selectedEyeDraft', selectedEye)
    localStorage.setItem('activePatientSession', JSON.stringify(activeSession))
    localStorage.setItem('acuityResult', acuityResult)
    localStorage.setItem('astigmatismAxis', astigmatismAxis)
    localStorage.setItem('contrastResult', contrastResult)
    localStorage.setItem('blinkRateResult', blinkRateResult)
    localStorage.setItem('launcherDismissed', launcherDismissed ? 'true' : 'false')
  }, [
    breaksTaken,
    ishiharaResult,
    activityLogs,
    healthScore,
    sessionHistory,
    patientName,
    selectedEye,
    activeSession,
    acuityResult,
    astigmatismAxis,
    contrastResult,
    blinkRateResult,
    launcherDismissed,
  ])

  // Reminder Countdown Logic
  useEffect(() => {
    let timer;
    if (nextReminderTime) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((nextReminderTime - Date.now()) / 1000))
        setCountdown(remaining)
        if (remaining === 0) {
          triggerReminder()
        }
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [nextReminderTime])

  const triggerReminder = () => {
    setNextReminderTime(null)
    setCountdown(0)
    setShowBreakGuide(true)
    if (Notification.permission === 'granted') {
      new Notification('👁️ EyeCare Pro: Break Time!', { 
        body: '20s Protocol Required: Blink, Look Away, Relax.', 
        icon: `${baseUrl}eye-icon.svg`,
        tag: 'eye-break'
      })
    }
  }

  const startReminders = (mins = reminderInterval) => {
    const nextTime = Date.now() + mins * 60 * 1000
    setNextReminderTime(nextTime)
    setCountdown(mins * 60)
    localStorage.setItem('reminderInterval', mins.toString())
  }

  const stopReminders = () => {
    setNextReminderTime(null)
    setCountdown(0)
  }

  // Health Decay Logic
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setHealthScore(prev => Math.max(0, prev - 2))
    }, 60000) // 2% decay every minute

    return () => clearInterval(decayInterval)
  }, [])

  useEffect(() => {
    setInstallEnv(getInstallEnvironment())

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isStandalone) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if ('Notification' in window && Notification.permission === 'granted') setNotificationsEnabled(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  useEffect(() => {
    if (!copiedInstallLink) return undefined

    const timeout = window.setTimeout(() => setCopiedInstallLink(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copiedInstallLink])

  const addLog = (type, value) => {
    const newLog = { 
      id: Date.now(), 
      type, 
      value, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    }
    setActivityLogs(prev => [newLog, ...prev].slice(0, 10))
  }

  const updateActiveSessionResults = (patch) => {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        results: {
          ...prev.results,
          ...patch,
        },
      }
    })
  }

  const startPatientSession = () => {
    const trimmedName = patientName.trim() || 'Guest Patient'
    const now = new Date()
    const nextSession = {
      id: Date.now(),
      patientName: trimmedName,
      eye: selectedEye,
      startedAt: now.toISOString(),
      startedAtLabel: now.toLocaleString(),
      results: {},
    }
    setPatientName(trimmedName)
    setActiveSession(nextSession)
    addLog('Session', `${trimmedName} | ${selectedEye}`)
    playClinicalTone('soft')
  }

  const finishPatientSession = () => {
    setActiveSession((prev) => {
      if (!prev) return null
      const completedAt = new Date()
      const completed = {
        ...prev,
        completedAt: completedAt.toISOString(),
        completedAtLabel: completedAt.toLocaleString(),
        results: {
          acuity: prev.results?.acuity || acuityResult,
          colorVision: prev.results?.colorVision || ishiharaResult,
          astigmatism: prev.results?.astigmatism || astigmatismAxis,
          contrast: prev.results?.contrast || contrastResult,
          blink: prev.results?.blink || blinkRateResult,
        },
      }
      setSessionHistory((history) => [completed, ...history].slice(0, 12))
      addLog('Session Saved', `${completed.patientName} | ${completed.eye}`)
      playClinicalTone('complete')
      openPatientPdfReport(completed)
      return null
    })
  }

  const resetAllData = () => {
    if (window.confirm('CRITICAL: Reset all medical history and scores?')) {
      localStorage.clear()
      setBreaksTaken(0)
      setHealthScore(0)
      setActivityLogs([])
      setIshiharaResult('Neutral')
      setContrastScore(0)
      setContrastStep(0)
      alert('System Sanitized. Baseline 0% restored.')
    }
  }

  const trackBreak = () => {
    setBreaksTaken(prev => prev + 1)
    setHealthScore(prev => Math.min(100, prev + 5))
    addLog('Rest Break', '+5% Health')
    if (Notification.permission === 'granted') {
       new Notification('EyeCare Pro', { body: 'Break tracked! System optimized.', icon: `${baseUrl}icons/icon-192.png` })
    }
    playClinicalTone('soft')
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstalled(true)
        setLauncherDismissed(true)
        setShowInstallHelp(false)
        setCurrentSection('content')
      } else {
        setLauncherDismissed(true)
        setShowInstallHelp(true)
        setCurrentSection('content')
      }
      return
    }
    setLauncherDismissed(true)
    setShowInstallHelp(true)
    setCurrentSection('content')
  }

  const handleCopyInstallLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedInstallLink(true)
      playClinicalTone('soft')
    } catch {
      setShowInstallHelp(true)
    }
  }

  const installInstructions = isInstalled
    ? ['EyeCare Pro is already installed on this device.', 'Open it from your home screen, desktop, or app launcher.']
    : getInstallInstructions(installEnv, Boolean(deferredPrompt))
  const installTitle = deferredPrompt
    ? 'INSTALL APP'
    : installEnv.isIos
      ? 'ADD TO HOME SCREEN'
      : 'INSTALL APP'
  const installHint = !installEnv.isSecure
    ? 'Install works only from HTTPS or localhost.'
    : deferredPrompt
      ? 'Your browser is ready to install EyeCare Pro.'
      : installEnv.isIos
        ? 'Safari installs this app from the Share menu.'
        : installEnv.isDesktop
          ? 'Chrome or Edge on desktop can install this as an app.'
          : 'Chrome or Edge on mobile can add this app to your home screen.'

  const handleRefreshApp = () => {
    playClinicalTone('soft')
    window.location.reload()
  }

  const enableNotifications = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      startReminders()
    }
  }

  const startRemindersLegacy = () => {
    startReminders(reminderInterval)
  }

  // Contrast Logic
  const handleContrastAnswer = (isCorrect) => {
    const newScore = isCorrect ? contrastScore + 1 : contrastScore
    setContrastScore(newScore)
    if (contrastStep < 5) {
      setContrastStep(prev => prev + 1)
      setContrastLevel(prev => Math.max(1, prev - 20))
    } else {
      const pct = Math.round((newScore / 6) * 100)
      const resultLabel = `${pct}% Sensitivity`
      setContrastResult(resultLabel)
      updateActiveSessionResults({ contrast: resultLabel })
      addLog('Contrast Test', `${pct}% Sensitivity`)
      setScreeningType(null)
      setToolReport({
        title: 'Contrast Sensitivity Report',
        subtitle: `${activeSession?.patientName || patientName || 'Patient'} | ${activeSession?.eye || selectedEye}`,
        result: resultLabel,
        metrics: [
          { label: 'Correct Responses', value: `${newScore}/6` },
          { label: 'Final Level', value: `${contrastLevel}%` },
          { label: 'Test Type', value: 'Contrast Lab' },
        ],
        notes: [
          'Higher percentage suggests better on-screen contrast sensitivity.',
          'Use this as a screening result, not a diagnosis.',
        ],
      })
      setContrastStep(0)
      setContrastLevel(100)
      playClinicalTone('success')
    }
  }

  // Blink Logic
  const startBlinkTracker = () => {
    setIsBlinkTracking(true); setBlinkCount(0); setBlinkTimer(60)
    timerRef.current = setInterval(() => {
      setBlinkTimer(p => {
        if (p <= 1) { 
          clearInterval(timerRef.current); 
          setIsBlinkTracking(false); 
          const blinkLabel = `${blinkCount} bpm`
          setBlinkRateResult(blinkLabel)
          updateActiveSessionResults({ blink: blinkLabel })
          addLog('Blink Rate', blinkLabel);
          playClinicalTone('success')
          return 0; 
        }
        return p - 1
      })
    }, 1000)
  }

  const resultsMetrics = {
    acuity: acuityResult,
    acuityNote: activeSession?.eye || selectedEye,
    colorVision: ishiharaResult,
    colorVisionNote: 'Ishihara quick check',
    astigmatism: astigmatismAxis,
    astigmatismNote: 'Approx axis',
    contrast: contrastResult,
    contrastNote: 'Sensitivity score',
    blink: blinkRateResult,
    blinkNote: 'Last 60s test',
  }

  const patientSummary = {
    name: activeSession?.patientName || patientName || 'No active patient',
    eye: activeSession?.eye || selectedEye,
    latestDate: sessionHistory[0]?.completedAtLabel || 'Today',
  }

  if (currentSection === 'home' && !isInstalled && !launcherDismissed) {
    return (
      <div className="landing-page">
        <div className="hero-section">
          <div className="eye-icon">👁️</div>
          <h1 className="premium-glow-text">EyeCare Pro</h1>
          <p className="description">Advanced Clinical Dashboard for Mobile</p>
          <p className="install-subtitle">{installHint}</p>
          <button
            className="install-btn install-primary-btn"
            onClick={() => {
              handleInstall()
            }}
          >
            <span className="install-btn-badge">APP</span>
            <span className="install-btn-copy">
              <strong>{installTitle}</strong>
              <small>{installEnv.isIos ? 'Fast setup from Safari' : 'One tap for mobile and desktop'}</small>
            </span>
            <span className="install-btn-arrow">→</span>
          </button>
          <button
            className="install-link-btn"
            onClick={() => {
              setShowInstallHelp(true)
              setCurrentSection('content')
            }}
          >
            Need manual steps?
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app premium-theme">
      <header className="app-header glass">
        <div className="logo-group">
          <div className="mini-logo">
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 256C100 256 160 140 256 140C352 140 412 256 412 256C412 256 352 372 256 372C160 372 100 256 100 256Z" stroke="#6366f1" strokeWidth="20"/>
              <circle cx="256" cy="256" r="60" fill="#6366f1"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>EyeCare Pro</h1>
            <span className="version-pill">v2.1-Clinical</span>
          </div>
        </div>
        <div className="header-stats">
          {countdown > 0 && (
            <div className="header-timer">
              <span className="time">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
              <span className="lab">NEXT REST</span>
            </div>
          )}
          <div className="mini-score">
            <span className="val">{healthScore}%</span>
            <span className="lab">INTEGRITY</span>
          </div>
          <button className="refresh-chip" onClick={handleRefreshApp}>REFRESH</button>
        </div>
      </header>

      {deferredPrompt && (
        <div className="install-banner glass-card animate-slide-down">
          <div className="banner-content">
            <span className="icon">APP</span>
            <div className="text">
                <h3>Download Mobile App</h3>
                <p>{installHint}</p>
              </div>
            </div>
          <button className="install-action-btn install-action-primary" onClick={handleInstall}>
            <span>{installTitle}</span>
            <span className="install-action-arrow">→</span>
          </button>
        </div>
      )}

      {showBreakGuide && (
        <div className="break-overlay glass-heavy animate-fade-in">
          <div className="break-card glass-card">
            <div className="break-header">
              <h2>Protocol Required: 20s Break</h2>
              <p>Execute mandatory ocular rest for system recovery.</p>
            </div>
            <div className="check-list">
              <label className={`check-item ${breakSteps.blink ? 'done' : ''}`}>
                <input type="checkbox" checked={breakSteps.blink} onChange={(e) => setBreakSteps(s => ({...s, blink: e.target.checked}))} />
                <span>Blink Squeeze (2s)</span>
              </label>
              <label className={`check-item ${breakSteps.lookAway ? 'done' : ''}`}>
                <input type="checkbox" checked={breakSteps.lookAway} onChange={(e) => setBreakSteps(s => ({...s, lookAway: e.target.checked}))} />
                <span>Focus 20ft Away</span>
              </label>
              <label className={`check-item ${breakSteps.hydrate ? 'done' : ''}`}>
                <input type="checkbox" checked={breakSteps.hydrate} onChange={(e) => setBreakSteps(s => ({...s, hydrate: e.target.checked}))} />
                <span>System Hydration</span>
              </label>
            </div>
            {breakSteps.blink && breakSteps.lookAway && breakSteps.hydrate && (
              <button className="complete-break-btn glow-btn" onClick={() => {
                setShowBreakGuide(false)
                setBreakSteps({ blink: false, lookAway: false, hydrate: false })
                trackBreak()
                startReminders()
              }}>SYSTEM RESTORED</button>
            )}
          </div>
        </div>
      )}

      {showInstallHelp && (
        <div className="install-help-overlay animate-fade-in">
          <div className="install-help-card glass-card">
            <div className="tool-report-head">
              <div>
                <span className="card-tag">APP INSTALL</span>
                <h3>Download / Install EyeCare Pro</h3>
                  <p>Use the browser install popup when available. If it does not appear, follow the steps below for your device.</p>
              </div>
              <button className="exit-btn" onClick={() => setShowInstallHelp(false)}>Close</button>
            </div>

              <div className="install-help-steps">
                {installInstructions.map((step, index) => (
                  <div className="install-help-step" key={step}>
                    <strong>Step {index + 1}</strong>
                    <p>{step}</p>
                  </div>
                ))}
                <div className="install-help-step">
                  <strong>Best browser</strong>
                  <p>{installEnv.isIos ? 'Safari on iPhone or iPad.' : 'Chrome or Edge usually gives the easiest install flow.'}</p>
                </div>
                <div className="install-help-step">
                  <strong>Install on another device</strong>
                  <p>Use Copy App Link, then open that link on your phone or computer and install it there.</p>
                </div>
              </div>

              <div className="install-help-actions">
                <button className="btn-secondary" onClick={handleCopyInstallLink}>
                  {copiedInstallLink ? 'LINK COPIED' : 'COPY APP LINK'}
                </button>
                <button className="btn-primary glow-btn" onClick={() => {
                  setShowInstallHelp(false)
                  setCurrentSection('content')
                }}>
                  OPEN APP
                </button>
                <button className="btn-secondary" onClick={handleRefreshApp}>REFRESH APP</button>
              </div>
          </div>
        </div>
      )}

      <ToolReportSheet report={toolReport} onClose={() => setToolReport(null)} />

      {activeTab === 'screening' && screeningType === 'snellen' && (
        <SnellenLab
          onExit={() => setScreeningType(null)}
          eyeLabel={activeSession?.eye || selectedEye}
          onComplete={(result) => {
            const acuityLabel = `${result.ratio} at ${result.distance}`
            setAcuityResult(acuityLabel)
            updateActiveSessionResults({ acuity: acuityLabel })
            addLog('Acuity', acuityLabel)
            playClinicalTone('success')
            setToolReport({
              title: 'Acuity Test Report',
              subtitle: `${activeSession?.patientName || patientName || 'Patient'} | ${activeSession?.eye || selectedEye}`,
              result: acuityLabel,
              metrics: [
                { label: 'Optotype', value: result.letter },
                { label: 'Size', value: `${result.sizeMm.toFixed(1)} mm` },
                { label: 'Distance', value: result.distance },
              ],
              notes: [
                'Saved from the current Snellen mobile screening view.',
                'Clinical confirmation is recommended for formal acuity assessment.',
              ],
            })
            setScreeningType(null)
          }}
        />
      )}

      <div className="scroll-container">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <ResultsDashboard
              patientSummary={patientSummary}
              metrics={resultsMetrics}
              sessionHistory={sessionHistory}
            />
            <div className="card glass hero-card">
              <div className="card-header">
                <span className="card-tag">SYSTEM STATUS</span>
                <button className="reset-action-btn" onClick={resetAllData}>Sanitize System</button>
              </div>
              <div className="health-gauge">
                <div className={`gauge-fill ${healthScore < 20 ? 'critical' : ''}`} style={{ width: `${healthScore}%` }}></div>
                <div className="gauge-label">
                  <span className="pct">{healthScore}%</span>
                  <span className="desc">Optical Integrity</span>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat"><span>Breaks</span><strong>{breaksTaken}</strong></div>
                <div className="stat"><span>Session Time</span><strong>{Math.floor((Date.now() - sessionStartTime) / 60000)}m</strong></div>
              </div>
            </div>

            <div className="card glass">
              <div className="card-title">🛡️ Rapid Optimization</div>
              <button className="btn-primary glow-btn" onClick={trackBreak}>Execute Rest Break</button>
              <p className="card-hint">Instantly restores 12% optical integrity</p>
            </div>

            <div className="card glass">
              <div className="card-title">📜 System Logs (Recent 10)</div>
              <div className="log-list">
                {activityLogs.length === 0 ? (
                  <p className="no-logs">No encrypted records found.</p>
                ) : activityLogs.map(log => (
                  <div key={log.id} className="log-item">
                    <span className="log-time">{log.time}</span>
                    <span className="log-type">{log.type}</span>
                    <span className="log-val">{log.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card glass">
              <div className="card-title">⏱️ Blink Stress Lab</div>
              {isBlinkTracking ? (
                <div onClick={() => setBlinkCount(c => c + 1)} className="blink-target active">
                  <div className="timer">{blinkTimer}s</div>
                  <div className="count">{blinkCount}</div>
                  <span className="tap-hint">TAP ON BLINK</span>
                </div>
              ) : (
                <button className="btn-secondary" onClick={startBlinkTracker}>Begin 60s Diagnostic</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-area">
            <div className="card glass info-card">
              <div className="card-title">🔬 Clinical Matter: Ergonomics</div>
              <div className="info-section">
                <h4>1. The 20-20-20 Advanced Protocol</h4>
                <p>Every 20 minutes, focus on an object at least 20 feet away for 20 seconds. <strong>Why?</strong> This relaxes the ciliary muscles in the eyes, which are constantly contracted during near-work like reading or coding.</p>
              </div>
              <div className="info-section">
                <h4>2. Ocular Geometry</h4>
                <p>Position your screen 15-20 degrees below eye level. This naturally lowers your eyelids, reducing the exposed surface area of the cornea and slowing down tear evaporation by up to 40%.</p>
              </div>
            </div>
            
            <div className="card glass">
              <div className="card-title">🧬 Photopic Stress & Blue Light</div>
              <div className="info-section">
                <p>High-energy visible (HEV) light, especially in the 415-455nm range, can cause oxidative stress in the retinal pigment epithelium.</p>
                <ul className="premium-list">
                  <li><strong>OLED Dark Mode</strong>: Eliminates backlight flicker and reduces total HEV output.</li>
                  <li><strong>Night Shift</strong>: Shift your color temperature to &lt; 3000K after sunset to protect melatonin production.</li>
                  <li><strong>Ambient Lighting</strong>: Ensure room lighting is equal to screen brightness to prevent "contrast fatigue".</li>
                </ul>
              </div>
            </div>

            <div className="card glass">
              <div className="card-title">💧 Ocular Surface Hygiene</div>
              <div className="info-section">
                <p>Digital Eye Strain is often actually <strong>Evaporative Dry Eye</strong>. Follow these protocols:</p>
                <ul className="premium-list">
                  <li><strong>Blink Squeeze</strong>: Every hour, close your eyes firmly for 2 seconds to engage Meibomian glands.</li>
                  <li><strong>Hydration</strong>: Systemic hydration directly impacts the volume of the aqueous layer in your tear film.</li>
                  <li><span>🛡️</span><strong>Pro Tip</strong>: Use a humidifier in your workspace to keep the air &gt; 45% moisture.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screening' && (
          <div className="screening-container">
            {!screeningType ? (
              <div className="lab-selector animate-fade-in">
                <PatientSessionPanel
                  patientName={patientName}
                  setPatientName={setPatientName}
                  selectedEye={selectedEye}
                  setSelectedEye={setSelectedEye}
                  activeSession={activeSession}
                  sessionHistory={sessionHistory}
                  onStartSession={startPatientSession}
                  onFinishSession={finishPatientSession}
                />
                <h2>Vision Screening Labs</h2>
                <div className="lab-grid">
                  <button className="lab-btn" onClick={() => setScreeningType('snellen')}>
                    <span className="icon">📐</span>
                    <span className="label">Acuity Lab</span>
                  </button>
                  <button className="lab-btn" onClick={() => { setScreeningType('ishihara'); }}>
                    <span className="icon">🌈</span>
                    <span className="label">Color Matrix</span>
                  </button>
                  <button className="lab-btn" onClick={() => setScreeningType('astigmatism')}>
                    <span className="icon">🕒</span>
                    <span className="label">Astigmatism</span>
                  </button>
                  <button className="lab-btn" onClick={() => { setScreeningType('contrast'); setContrastStep(0); setContrastScore(0); setContrastLevel(100); }}>
                    <span className="icon">🌓</span>
                    <span className="label">Contrast Lab</span>
                  </button>
                </div>
              </div>
            ) : screeningType === 'snellen' ? null : (
              <div className="card glass screening-box">
                <button className="exit-btn" onClick={() => setScreeningType(null)}>← TERMINATE SESSION</button>
                
                {screeningType === 'ishihara' && (
                  <IshiharaLab
                    onExit={() => setScreeningType(null)}
                    onComplete={({ pct, label }) => {
                      const result = `${label} (${pct}%)`
                      setIshiharaResult(result)
                      updateActiveSessionResults({ colorVision: result })
                      addLog('Color Vision', result)
                      setScreeningType(null)
                      setToolReport({
                        title: 'Color Vision Report',
                        subtitle: `${activeSession?.patientName || patientName || 'Patient'} | ${activeSession?.eye || selectedEye}`,
                        result,
                        metrics: [
                          { label: 'Accuracy', value: `${pct}%` },
                          { label: 'Interpretation', value: label },
                          { label: 'Test Plates', value: '12' },
                        ],
                        notes: [
                          'Ishihara screening estimates red-green color vision performance.',
                          'Lighting and display quality can affect the result.',
                        ],
                      })
                      playClinicalTone('success')
                    }}
                  />
                )}

                {screeningType === 'astigmatism' && (
                  <AstigmatismPrecisionTest
                    onExit={() => setScreeningType(null)}
                    onSaveResult={(report) => {
                      if (typeof report.fusedAxis === 'number') {
                        const axisLabel = `${Math.round(report.fusedAxis)} deg`
                        setAstigmatismAxis(axisLabel)
                        updateActiveSessionResults({ astigmatism: axisLabel })
                        addLog('Astigmatism', `Approx axis ${axisLabel}`)
                        setToolReport({
                          title: 'Astigmatism Report',
                          subtitle: `${activeSession?.patientName || patientName || 'Patient'} | ${activeSession?.eye || selectedEye}`,
                          result: axisLabel,
                          metrics: [
                            { label: 'Selected Lines', value: report.selectedAngles?.length ? report.selectedAngles.map((angle) => `${Math.round(angle)} deg`).join(', ') : 'None' },
                            { label: 'Rotating Test', value: report.rotationCaptures?.length ? report.rotationCaptures.map((angle) => `${Math.round(angle)} deg`).join(', ') : 'No captures' },
                            { label: 'Approx Axis', value: axisLabel },
                          ],
                          notes: [
                            'Axis is estimated from selected meridians and optional rotating-line captures.',
                            'This is a screening output only.',
                          ],
                        })
                      } else {
                        addLog('Astigmatism', 'Screen completed')
                      }
                      playClinicalTone('complete')
                    }}
                  />
                )}

                {screeningType === 'contrast' && (
                  <div className="lab-panel">
                    <div className="panel-header">
                      <h3>Contrast Sensitivity {contrastStep + 1}/6</h3>
                      <span className="diff">Level: {contrastLevel}%</span>
                    </div>
                    <div className="contrast-viewport">
                      <div className="letter" style={{ opacity: contrastLevel / 100 }}>
                        {snellenLetters[Math.floor(Math.random() * snellenLetters.length)]}
                      </div>
                    </div>
                    <div style={{marginTop: '20px'}}>
                      <p className="hint">Identify the character above.</p>
                      <div className="decision-group">
                        <button className="btn-pass" onClick={() => handleContrastAnswer(true)}>VISIBLE</button>
                        <button className="btn-fail" onClick={() => handleContrastAnswer(false)}>INVISIBLE</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="reminders-container">
            <div className="card glass hero-card">
              <div className="card-title">🔔 Vision Protection Protocol</div>
              <div className="settings-panel">
                <p className="description">Integrated automated ocular rest signals.</p>
                
                {!notificationsEnabled ? (
                  <button className="glow-btn btn-full large-action" onClick={enableNotifications}>INITIALIZE PROTOCOL</button>
                ) : (
                  <div className="protocol-controls">
                    <div className={`status-badge ${nextReminderTime ? 'active' : 'idle'}`}>
                      {nextReminderTime ? 'PROTOCOL EXECUTING' : 'PROTOCOL STANDBY'}
                    </div>

                    <div className="interval-selector">
                      <label>REST INTERVAL</label>
                      <div className="interval-grid">
                        {[1, 5, 20, 40, 60].map(mins => (
                          <button 
                            key={mins} 
                            className={`interval-btn ${reminderInterval === mins ? 'selected' : ''}`}
                            onClick={() => { setReminderInterval(mins); startReminders(mins); }}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {countdown > 0 ? (
                      <div className="live-countdown-card glass-inner">
                        <div className="timer-display">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</div>
                        <p>SEC UNTIL MANDATORY BREAK</p>
                        <button className="btn-secondary btn-sm" onClick={stopReminders}>ABORT PROTOCOL</button>
                      </div>
                    ) : (
                      <button className="btn-primary glow-btn btn-full" onClick={() => startReminders(reminderInterval)}>ENGAGE PROTOCOL</button>
                    )}

                    <div className="demo-section">
                      <p className="hint">Rapid Validation Mode</p>
                      <button className="glass-btn btn-xs" onClick={() => { setReminderInterval(1); startReminders(1); }}>Test 60s Cycle</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card glass">
              <div className="card-title">📖 Protocol Reference</div>
              <div className="protocol-steps">
                <div className="p-step">
                  <span className="step-num">1</span>
                  <div className="step-text">
                    <strong>Signal Detection</strong>
                    <p>When the notification triggers, immediately cease screen activity.</p>
                  </div>
                </div>
                <div className="p-step">
                  <span className="step-num">2</span>
                  <div className="step-text">
                    <strong>20-20-20 Execution</strong>
                    <p>Focus on an object 20ft away for a minimum of 20 seconds.</p>
                  </div>
                </div>
                <div className="p-step">
                  <span className="step-num">3</span>
                  <div className="step-text">
                    <strong>Checklist Verification</strong>
                    <p>Complete the on-screen recovery checklist to resume.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="developer-container">
            <div className="card glass developer-card">
              <div className="dev-header">
                <div className="dev-avatar">
                   <span>GN</span>
                </div>
                <div className="dev-title-group">
                  <h2 className="premium-glow-text">Goteti Naga Sai Santhosh</h2>
                  <span className="dev-role">System Architect & Lead Developer</span>
                </div>
              </div>
              
              <div className="dev-content">
                <div className="info-item">
                  <span className="label">CREDENTIALS</span>
                  <span className="value">B.Sc. Optometry</span>
                </div>
                <div className="info-item">
                   <span className="label">AFFILIATION</span>
                   <span className="value">Centurion University of Management and Technology</span>
                </div>
              </div>
              <div className="profile-install-wrap">
                <button
                  className="install-btn install-primary-btn profile-install-btn"
                  onClick={handleInstall}
                >
                  <span className="install-btn-badge">APP</span>
                  <span className="install-btn-copy">
                    <strong>{installTitle}</strong>
                    <small>{installEnv.isIos ? 'Add it from Safari in one step' : 'Install EyeCare Pro on phone or PC'}</small>
                  </span>
                  <span className="install-btn-arrow">→</span>
                </button>
                <button
                  className="install-link-btn profile-install-link"
                  onClick={() => setShowInstallHelp(true)}
                >
                  Need manual install steps?
                </button>
              </div>
            </div>

            <div className="card glass">
               <div className="card-title">👨‍⚕️ Professional Overview</div>
               <p className="description" style={{marginBottom: 0}}>Passionate Optometry professional dedicated to digital health innovation and clinical diagnostics.</p>
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav glass">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊<span>Health</span></button>
        <button className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>🔬<span>Library</span></button>
        <button className={`nav-item ${activeTab === 'screening' ? 'active' : ''}`} onClick={() => setActiveTab('screening')}>🧪<span>Labs</span></button>
        <button className={`nav-item ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>🔔<span>Alerts</span></button>
        <button className={`nav-item ${activeTab === 'developer' ? 'active' : ''}`} onClick={() => setActiveTab('developer')}>👨‍💻<span>Author</span></button>
      </nav>
    </div>
  )
}

export default App

