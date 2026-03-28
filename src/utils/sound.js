let audioContext = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!audioContext) {
    audioContext = new AudioContextClass()
  }
  return audioContext
}

const pulse = (context, startTime, frequency, duration, gainValue) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export const playClinicalTone = async (variant = 'soft') => {
  const context = getAudioContext()
  if (!context) return

  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return
    }
  }

  const start = context.currentTime

  if (variant === 'success') {
    pulse(context, start, 660, 0.16, 0.025)
    pulse(context, start + 0.11, 880, 0.2, 0.03)
    return
  }

  if (variant === 'complete') {
    pulse(context, start, 520, 0.12, 0.02)
    pulse(context, start + 0.08, 660, 0.16, 0.024)
    pulse(context, start + 0.18, 780, 0.24, 0.026)
    return
  }

  pulse(context, start, 540, 0.14, 0.018)
}
