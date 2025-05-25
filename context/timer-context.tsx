'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import {
  DEFAULT_SETTINGS,
  TimerContextType,
  TimerSettings,
  TimerState,
  getRandomInterval,
} from '@/lib/timer-utils'
import { playAudio, preloadAudio, AUDIO_FILE_MAP } from '@/lib/audio-utils'

const TimerContext = createContext<TimerContextType | undefined>(undefined)

// 本地存储键名
const SETTINGS_STORAGE_KEY = 'focus-timer-settings'

// 从本地存储加载设置
const loadSettingsFromStorage = (): TimerSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsedSettings = JSON.parse(stored)
      // 合并默认设置和存储的设置，确保新增的设置项有默认值
      return { ...DEFAULT_SETTINGS, ...parsedSettings }
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
  }

  return DEFAULT_SETTINGS
}

// 保存设置到本地存储
const saveSettingsToStorage = (settings: TimerSettings) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [settings, setSettings] = useState<TimerSettings>(() => {
    // 在服务端渲染时使用默认设置，避免hydration不匹配
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS
    }
    // 在客户端使用存储的设置
    return loadSettingsFromStorage()
  })
  const [isRunning, setIsRunning] = useState(false)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const shortBreakTimerRef = useRef<NodeJS.Timeout | null>(null)
  const savedTimeRef = useRef<number>(0)

  // 在客户端挂载后加载设置
  useEffect(() => {
    if (typeof window !== 'undefined' && !isSettingsLoaded) {
      const loadedSettings = loadSettingsFromStorage()
      setSettings(loadedSettings)
      setIsSettingsLoaded(true)
    }
  }, [isSettingsLoaded])

  // 在组件挂载时预加载音效文件
  useEffect(() => {
    if (isSettingsLoaded) {
      // 预加载音效文件
      const soundsToPreload = [settings.shortBreakSound, settings.endSound]
      preloadAudio(soundsToPreload)
    }
  }, [settings.shortBreakSound, settings.endSound, isSettingsLoaded])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (shortBreakTimerRef.current) clearTimeout(shortBreakTimerRef.current)
    }
  }, [])

  // Handle timer logic
  useEffect(() => {
    if (!isRunning) return

    if (
      state === 'focusing' ||
      state === 'shortBreak' ||
      state === 'longBreak'
    ) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)

            // Play end sound
            playAudio(settings.endSound, 0.7)

            // Update state based on which timer completed
            if (state === 'focusing' || state === 'shortBreak') {
              setState('focusComplete')
            } else {
              setState('longBreakComplete')
            }

            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, state, settings.endSound])

  // Schedule random short breaks during focus time
  useEffect(() => {
    if (state === 'focusing' && isRunning) {
      scheduleNextShortBreak()
    }

    return () => {
      if (shortBreakTimerRef.current) clearTimeout(shortBreakTimerRef.current)
    }
  }, [state, isRunning])

  // Handle short break logic
  useEffect(() => {
    if (state === 'shortBreak' && isRunning) {
      const shortBreakDuration = 10 // 10 seconds
      // Don't change the displayed time, keep showing focus time

      const shortBreakTimer = setTimeout(() => {
        // Only return to focusing if we're still in shortBreak state
        // (not if focus time has ended during the break)
        setState((currentState) => {
          if (currentState === 'shortBreak') {
            return 'focusing'
          }
          return currentState
        })
      }, shortBreakDuration * 1000)

      return () => {
        clearTimeout(shortBreakTimer)
      }
    }
  }, [state, isRunning])

  const scheduleNextShortBreak = () => {
    if (shortBreakTimerRef.current) clearTimeout(shortBreakTimerRef.current)

    const interval = getRandomInterval(
      settings.shortBreakMinInterval,
      settings.shortBreakMaxInterval
    )

    shortBreakTimerRef.current = setTimeout(() => {
      if (state === 'focusing' && isRunning) {
        // Play short break sound
        playAudio(settings.shortBreakSound, 0.6)

        setState('shortBreak')
      }
    }, interval * 1000)
  }

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings }
      saveSettingsToStorage(updatedSettings)
      return updatedSettings
    })
  }

  const startFocus = () => {
    setTimeRemaining(settings.focusDuration * 60)
    setState('focusing')
    setIsRunning(true)
  }

  const startLongBreak = () => {
    setTimeRemaining(settings.longBreakDuration * 60)
    setState('longBreak')
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resumeTimer = () => {
    setIsRunning(true)
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (shortBreakTimerRef.current) clearTimeout(shortBreakTimerRef.current)
    setState('idle')
    setTimeRemaining(0)
    setIsRunning(false)
  }

  return (
    <TimerContext.Provider
      value={{
        state,
        timeRemaining,
        settings,
        isRunning,
        updateSettings,
        startFocus,
        startLongBreak,
        pauseTimer,
        resumeTimer,
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
