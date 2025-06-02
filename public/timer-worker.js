// Web Worker for timer functionality
// This runs in a separate thread and is not affected by browser tab throttling

let timerState = {
  isRunning: false,
  timeRemaining: 0,
  state: 'idle', // 'idle', 'focusing', 'longBreak', 'focusComplete', 'longBreakComplete'
  focusDuration: 90 * 60, // in seconds
  shortBreakMinInterval: 3 * 60, // in seconds
  shortBreakMaxInterval: 5 * 60, // in seconds
  longBreakDuration: 20 * 60, // in seconds
  nextShortBreakTime: null,
  startTime: null,
  totalPausedTime: 0, // Total time spent paused
  pauseStartTime: null, // When the current pause started
}

let mainInterval = null
let shortBreakTimeout = null

// Generate random interval between min and max seconds
function getRandomInterval(minSeconds, maxSeconds) {
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds
}

// Schedule next short break
function scheduleNextShortBreak() {
  if (timerState.state !== 'focusing' || !timerState.isRunning) return

  const interval = getRandomInterval(
    timerState.shortBreakMinInterval,
    timerState.shortBreakMaxInterval
  )

  timerState.nextShortBreakTime = Date.now() + interval * 1000

  // Clear existing timeout
  if (shortBreakTimeout) {
    clearTimeout(shortBreakTimeout)
  }

  shortBreakTimeout = setTimeout(() => {
    if (timerState.state === 'focusing' && timerState.isRunning) {
      // Send message to main thread to play short break sound
      // But keep the state as 'focusing' - don't change to 'shortBreak'
      self.postMessage({
        type: 'SHORT_BREAK_START',
        data: {
          state: timerState.state, // Keep as 'focusing'
          timeRemaining: timerState.timeRemaining,
          soundToPlay: 'shortBreak', // 指示要播放短休息音效
        },
      })

      // Schedule next short break after 10 seconds (no state change needed)
      setTimeout(() => {
        if (timerState.state === 'focusing' && timerState.isRunning) {
          // Schedule next short break
          scheduleNextShortBreak()
        }
      }, 10000)
    }
  }, interval * 1000)
}

// Main timer tick function
function tick() {
  if (!timerState.isRunning) return

  const now = Date.now()

  if (timerState.state === 'focusing' || timerState.state === 'longBreak') {
    // Calculate actual time remaining based on real time
    if (timerState.startTime) {
      const totalElapsed = Math.floor(
        (now - timerState.startTime - timerState.totalPausedTime) / 1000
      )
      const initialTime =
        timerState.state === 'focusing'
          ? timerState.focusDuration
          : timerState.longBreakDuration
      timerState.timeRemaining = Math.max(0, initialTime - totalElapsed)
    }

    // Check if timer finished
    if (timerState.timeRemaining <= 0) {
      timerState.isRunning = false

      if (timerState.state === 'focusing') {
        timerState.state = 'focusComplete'
      } else if (timerState.state === 'longBreak') {
        timerState.state = 'longBreakComplete'
      }

      // Clear short break timeout
      if (shortBreakTimeout) {
        clearTimeout(shortBreakTimeout)
        shortBreakTimeout = null
      }

      // Send completion message
      self.postMessage({
        type: 'TIMER_COMPLETE',
        data: {
          state: timerState.state,
          timeRemaining: 0,
          soundToPlay: 'end', // 指示要播放结束音效
        },
      })

      return
    }
  }

  // Send regular update
  self.postMessage({
    type: 'TIMER_UPDATE',
    data: {
      state: timerState.state,
      timeRemaining: timerState.timeRemaining,
      isRunning: timerState.isRunning,
    },
  })
}

// Handle messages from main thread
self.onmessage = function (e) {
  const { type, data } = e.data

  switch (type) {
    case 'START_FOCUS':
      timerState.state = 'focusing'
      timerState.timeRemaining = data.focusDuration * 60
      timerState.focusDuration = data.focusDuration * 60
      timerState.shortBreakMinInterval = data.shortBreakMinInterval * 60
      timerState.shortBreakMaxInterval = data.shortBreakMaxInterval * 60
      timerState.isRunning = true
      timerState.startTime = Date.now()
      timerState.totalPausedTime = 0
      timerState.pauseStartTime = null

      // Schedule first short break
      scheduleNextShortBreak()

      // Start main timer and send immediate update
      if (mainInterval) clearInterval(mainInterval)
      mainInterval = setInterval(tick, 1000)

      // Send immediate update to avoid 1-second delay
      tick()

      break

    case 'START_LONG_BREAK':
      timerState.state = 'longBreak'
      timerState.timeRemaining = data.longBreakDuration * 60
      timerState.longBreakDuration = data.longBreakDuration * 60
      timerState.isRunning = true
      timerState.startTime = Date.now()
      timerState.totalPausedTime = 0
      timerState.pauseStartTime = null

      // Start main timer and send immediate update
      if (mainInterval) clearInterval(mainInterval)
      mainInterval = setInterval(tick, 1000)

      // Send immediate update to avoid 1-second delay
      tick()

      break

    case 'PAUSE':
      if (timerState.isRunning) {
        timerState.isRunning = false
        timerState.pauseStartTime = Date.now()

        // Clear short break timeout
        if (shortBreakTimeout) {
          clearTimeout(shortBreakTimeout)
          shortBreakTimeout = null
        }

        if (mainInterval) {
          clearInterval(mainInterval)
          mainInterval = null
        }

        // Send immediate update to reflect paused state
        self.postMessage({
          type: 'TIMER_UPDATE',
          data: {
            state: timerState.state,
            timeRemaining: timerState.timeRemaining,
            isRunning: timerState.isRunning,
          },
        })
      }
      break

    case 'RESUME':
      if (
        !timerState.isRunning &&
        (timerState.state === 'focusing' || timerState.state === 'longBreak')
      ) {
        timerState.isRunning = true

        // Add the pause duration to total paused time
        if (timerState.pauseStartTime) {
          timerState.totalPausedTime += Date.now() - timerState.pauseStartTime
          timerState.pauseStartTime = null
        }

        // Reschedule short break if in focusing mode
        if (timerState.state === 'focusing') {
          scheduleNextShortBreak()
        }

        // Restart main timer and send immediate update
        if (mainInterval) clearInterval(mainInterval)
        mainInterval = setInterval(tick, 1000)

        // Send immediate update
        tick()
      }
      break

    case 'RESET':
      timerState.isRunning = false
      timerState.state = 'idle'
      timerState.timeRemaining = 0
      timerState.nextShortBreakTime = null
      timerState.startTime = null
      timerState.totalPausedTime = 0
      timerState.pauseStartTime = null

      if (mainInterval) {
        clearInterval(mainInterval)
        mainInterval = null
      }

      if (shortBreakTimeout) {
        clearTimeout(shortBreakTimeout)
        shortBreakTimeout = null
      }

      // Send immediate update to reflect reset state
      self.postMessage({
        type: 'TIMER_UPDATE',
        data: {
          state: timerState.state,
          timeRemaining: timerState.timeRemaining,
          isRunning: timerState.isRunning,
        },
      })

      break

    case 'UPDATE_SETTINGS':
      timerState.focusDuration = data.focusDuration * 60
      timerState.shortBreakMinInterval = data.shortBreakMinInterval * 60
      timerState.shortBreakMaxInterval = data.shortBreakMaxInterval * 60
      timerState.longBreakDuration = data.longBreakDuration * 60
      break
  }
}

// Send initial state
self.postMessage({
  type: 'WORKER_READY',
  data: {
    state: timerState.state,
    timeRemaining: timerState.timeRemaining,
    isRunning: timerState.isRunning,
  },
})
