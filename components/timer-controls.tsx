'use client'

import { Button } from '@/components/ui/button'
import { useTimer } from '@/context/timer-context'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { motion } from 'framer-motion'

export function TimerControls() {
  const {
    state,
    isRunning,
    startFocus,
    startLongBreak,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useTimer()

  const renderControls = () => {
    switch (state) {
      case 'idle':
        return (
          <Button size="lg" onClick={startFocus} className="gap-2">
            <Play size={18} />
            Start Focus Session
          </Button>
        )

      case 'focusing':
        return isRunning ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={pauseTimer}
              className="gap-2"
            >
              <Pause size={18} />
              Pause
            </Button>
            <Button variant="ghost" size="icon" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="lg" onClick={resumeTimer} className="gap-2">
              <Play size={18} />
              Resume Focus
            </Button>
            <Button variant="ghost" size="icon" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
          </div>
        )

      case 'shortBreak':
        return (
          <Button
            size="lg"
            variant="outline"
            disabled
            className="gap-2 bg-blue-500/10 text-blue-500 border-blue-500/20"
          >
            Break Time (10s)
          </Button>
        )

      case 'focusComplete':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="lg" onClick={startLongBreak} className="gap-2">
              <Coffee size={18} />
              Start Long Break
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={startFocus}
              className="gap-2"
            >
              <Play size={18} />
              Start New Focus
            </Button>
          </div>
        )

      case 'longBreak':
        return isRunning ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={pauseTimer}
              className="gap-2"
            >
              <Pause size={18} />
              Pause Break
            </Button>
            <Button variant="ghost" size="icon" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="lg" onClick={resumeTimer} className="gap-2">
              <Play size={18} />
              Resume Break
            </Button>
            <Button variant="ghost" size="icon" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
          </div>
        )

      case 'longBreakComplete':
        return (
          <Button size="lg" onClick={startFocus} className="gap-2">
            <Play size={18} />
            Start Focus Session
          </Button>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      className="flex justify-center mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {renderControls()}
    </motion.div>
  )
}
