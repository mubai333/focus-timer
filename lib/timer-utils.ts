// Calculate time remaining in format MM:SS
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

// Generate a random interval in seconds based on min and max minutes
export function getRandomInterval(
  minMinutes: number,
  maxMinutes: number
): number {
  const minSeconds = minMinutes * 60
  const maxSeconds = maxMinutes * 60
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds
}

export const DEFAULT_SETTINGS = {
  focusDuration: 60, // in minutes
  shortBreakMinInterval: 5, // in minutes
  shortBreakMaxInterval: 8, // in minutes
  longBreakDuration: 10, // in minutes
  shortBreakSound: 'bell-soft',
  endSound: 'success-chime',
}

export type TimerSettings = typeof DEFAULT_SETTINGS

export type TimerState =
  | 'idle'
  | 'focusing'
  | 'longBreak'
  | 'focusComplete'
  | 'longBreakComplete'

export type TimerContextType = {
  state: TimerState
  timeRemaining: number
  settings: TimerSettings
  isRunning: boolean
  showShortBreakHint: boolean
  isSettingsLoaded: boolean
  updateSettings: (settings: Partial<TimerSettings>) => void
  startFocus: () => void
  startLongBreak: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
}
