'use client'

import React from 'react'
import { formatTime } from '@/lib/timer-utils'
import { useTimer } from '@/context/timer-context'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function TimerDisplay() {
  const {
    state,
    timeRemaining,
    isRunning,
    settings,
    showShortBreakHint,
    isSettingsLoaded,
  } = useTimer()

  const getStatusText = () => {
    // Show short break hint if active
    if (showShortBreakHint) {
      return 'Take a 10s Break'
    }

    switch (state) {
      case 'idle':
        return 'Ready to Focus'
      case 'focusing':
        return isRunning ? 'Focusing' : 'Focus Paused'
      case 'longBreak':
        return isRunning ? 'Long Break' : 'Break Paused'
      case 'focusComplete':
        return 'Focus Complete'
      case 'longBreakComplete':
        return 'Break Complete'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    // Show blue color for short break hint
    if (showShortBreakHint) {
      return 'text-blue-500'
    }

    switch (state) {
      case 'focusing':
        return 'text-primary'
      case 'longBreak':
        return 'text-emerald-500'
      case 'focusComplete':
      case 'longBreakComplete':
        return 'text-amber-500'
      default:
        return 'text-muted-foreground'
    }
  }

  // 在设置加载完成之前显示默认状态，避免水合错误
  if (!isSettingsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="text-6xl font-bold tracking-tighter md:text-8xl font-mono text-muted-foreground">
          {formatTime(settings.focusDuration * 60)}
        </div>
        <div className="text-lg font-medium text-muted-foreground">
          Ready to Focus
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <motion.div
        className={cn(
          'text-6xl font-bold tracking-tighter md:text-8xl font-mono',
          state !== 'idle' ? 'text-foreground' : 'text-muted-foreground'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {state === 'idle'
          ? formatTime(settings.focusDuration * 60)
          : formatTime(timeRemaining)}
      </motion.div>

      <motion.div
        className={cn('text-lg font-medium', getStatusColor())}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {getStatusText()}
      </motion.div>
    </div>
  )
}
