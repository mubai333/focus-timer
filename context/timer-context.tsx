'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  DEFAULT_SETTINGS,
  TimerContextType,
  TimerSettings,
} from '@/lib/timer-utils'
import { preloadAudio } from '@/lib/audio-utils'
import { useTimerWorker } from '@/hooks/use-timer-worker'

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
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  // 使用Web Worker Hook
  const {
    state,
    timeRemaining,
    isRunning,
    showShortBreakHint,
    startFocus: workerStartFocus,
    startLongBreak: workerStartLongBreak,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateSettings: workerUpdateSettings,
    isWorkerReady,
  } = useTimerWorker(settings)

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

  // 当设置更新时，同步到Worker
  useEffect(() => {
    if (isWorkerReady) {
      workerUpdateSettings(settings)
    }
  }, [settings, isWorkerReady, workerUpdateSettings])

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings }
      saveSettingsToStorage(updatedSettings)
      return updatedSettings
    })
  }

  const startFocus = () => {
    workerStartFocus(settings)
  }

  const startLongBreak = () => {
    workerStartLongBreak(settings)
  }

  return (
    <TimerContext.Provider
      value={{
        state,
        timeRemaining,
        settings,
        isRunning,
        showShortBreakHint,
        isSettingsLoaded,
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
