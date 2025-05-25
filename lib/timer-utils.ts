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
  focusDuration: 90, // in minutes
  shortBreakMinInterval: 3, // in minutes
  shortBreakMaxInterval: 5, // in minutes
  longBreakDuration: 20, // in minutes
  shortBreakSound: 'bell-soft',
  endSound: 'success-chime',
}

export type TimerSettings = typeof DEFAULT_SETTINGS

export type TimerState =
  | 'idle'
  | 'focusing'
  | 'shortBreak'
  | 'longBreak'
  | 'focusComplete'
  | 'longBreakComplete'

export type TimerContextType = {
  state: TimerState
  timeRemaining: number
  settings: TimerSettings
  isRunning: boolean
  updateSettings: (settings: Partial<TimerSettings>) => void
  startFocus: () => void
  startLongBreak: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
}
