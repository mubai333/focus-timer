'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TimerState, TimerSettings } from '@/lib/timer-utils'
import { playAudio } from '@/lib/audio-utils'

interface TimerWorkerState {
  state: TimerState
  timeRemaining: number
  isRunning: boolean
}

interface TimerWorkerHook {
  state: TimerState
  timeRemaining: number
  isRunning: boolean
  showShortBreakHint: boolean
  startFocus: (settings: TimerSettings) => void
  startLongBreak: (settings: TimerSettings) => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  updateSettings: (settings: TimerSettings) => void
  isWorkerReady: boolean
}

export function useTimerWorker(settings: TimerSettings): TimerWorkerHook {
  const workerRef = useRef<Worker | null>(null)
  const [workerState, setWorkerState] = useState<TimerWorkerState>({
    state: 'idle',
    timeRemaining: 0,
    isRunning: false,
  })
  const [isWorkerReady, setIsWorkerReady] = useState(false)
  const [soundToPlay, setSoundToPlay] = useState<string | null>(null)
  const [showShortBreakHint, setShowShortBreakHint] = useState(false)
  const isPageVisible = useRef(true)

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        workerRef.current = new Worker('/timer-worker.js')

        workerRef.current.onmessage = (e) => {
          const { type, data } = e.data

          switch (type) {
            case 'WORKER_READY':
              setIsWorkerReady(true)
              setWorkerState(data)
              break

            case 'TIMER_UPDATE':
              setWorkerState(data)
              break

            case 'SHORT_BREAK_START':
              setWorkerState(data)
              if (data.soundToPlay) {
                setSoundToPlay(data.soundToPlay)
              }
              // Show short break hint for 3 seconds
              setShowShortBreakHint(true)
              setTimeout(() => setShowShortBreakHint(false), 3000)
              break

            case 'SHORT_BREAK_END':
              setWorkerState(data)
              break

            case 'TIMER_COMPLETE':
              setWorkerState(data)
              if (data.soundToPlay) {
                setSoundToPlay(data.soundToPlay)
              }
              break
          }
        }

        workerRef.current.onerror = (error) => {
          console.error('Timer worker error:', error)
          setIsWorkerReady(false)
        }
      } catch (error) {
        console.error('Failed to create timer worker:', error)
        setIsWorkerReady(false)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  // Update worker settings when settings change
  useEffect(() => {
    if (workerRef.current && isWorkerReady) {
      workerRef.current.postMessage({
        type: 'UPDATE_SETTINGS',
        data: settings,
      })
    }
  }, [settings, isWorkerReady])

  // Handle sound playing with latest settings
  useEffect(() => {
    if (soundToPlay) {
      if (soundToPlay === 'shortBreak') {
        console.log('Playing short break sound:', settings.shortBreakSound)
        playAudio(settings.shortBreakSound, 0.6)
      } else if (soundToPlay === 'end') {
        console.log('Playing end sound:', settings.endSound)
        playAudio(settings.endSound, 0.7)
      }
      setSoundToPlay(null) // Clear the sound trigger
    }
  }, [soundToPlay, settings.shortBreakSound, settings.endSound])

  const startFocus = useCallback((currentSettings: TimerSettings) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'START_FOCUS',
        data: currentSettings,
      })
    }
  }, [])

  const startLongBreak = useCallback((currentSettings: TimerSettings) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'START_LONG_BREAK',
        data: currentSettings,
      })
    }
  }, [])

  const pauseTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'PAUSE',
      })
    }
  }, [])

  const resumeTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'RESUME',
      })
    }
  }, [])

  const resetTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'RESET',
      })
    }
  }, [])

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'UPDATE_SETTINGS',
        data: newSettings,
      })
    }
  }, [])

  return {
    state: workerState.state,
    timeRemaining: workerState.timeRemaining,
    isRunning: workerState.isRunning,
    showShortBreakHint,
    startFocus,
    startLongBreak,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateSettings,
    isWorkerReady,
  }
}
