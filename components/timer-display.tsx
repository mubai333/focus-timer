'use client'

import React from 'react'
import { formatTime } from '@/lib/timer-utils'
import { useTimer } from '@/context/timer-context'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function TimerDisplay() {
  const { state, timeRemaining, isRunning, settings } = useTimer()

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Ready to Focus'
      case 'focusing':
        return isRunning ? 'Focusing' : 'Focus Paused'
      case 'shortBreak':
        return 'Take a 10s Break'
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
    switch (state) {
      case 'focusing':
        return 'text-primary'
      case 'shortBreak':
        return 'text-blue-500'
      case 'longBreak':
        return 'text-emerald-500'
      case 'focusComplete':
      case 'longBreakComplete':
        return 'text-amber-500'
      default:
        return 'text-muted-foreground'
    }
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
