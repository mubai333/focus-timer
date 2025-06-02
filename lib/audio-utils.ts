// 音效选项配置
export const AUDIO_OPTIONS = {
  shortBreakSounds: [
    { value: 'bell-soft', label: '轻柔铃声', description: '温和的提醒音' },
    { value: 'chime-gentle', label: '轻柔风铃', description: '舒缓的风铃声' },
    { value: 'water-drop', label: '水滴声', description: '清脆的水滴音效' },
    {
      value: 'notification-soft',
      label: '轻柔提示',
      description: '温和的通知音',
    },
  ],
  endSounds: [
    {
      value: 'success-chime',
      label: '完成',
      description: '成功完成的音效',
    },
    {
      value: 'meditation-bell',
      label: '冥想铃',
      description: '深沉的冥想铃声',
    },
    { value: 'nature-birds', label: '鸟鸣声', description: '自然鸟鸣音效' },
    { value: 'piano-chord', label: '庆祝完成', description: '庆祝完成' },
  ],
}

// 音效文件路径映射
export const AUDIO_FILE_MAP = {
  // 短休提示音
  'bell-soft': '/sounds/bell.mp3',
  'chime-gentle': '/sounds/chime.wav',
  'water-drop': '/sounds/water.wav',
  'notification-soft': '/sounds/notification.wav',

  // 结束提示音
  'success-chime': '/sounds/success.wav',
  'meditation-bell': '/sounds/meditation.wav',
  'nature-birds': '/sounds/bird.wav',
  'piano-chord': '/sounds/complete.wav',
}

// 播放音效的工具函数
export const playAudio = (soundKey: string, volume: number = 0.5) => {
  if (typeof window === 'undefined') return

  const audioPath = AUDIO_FILE_MAP[soundKey as keyof typeof AUDIO_FILE_MAP]
  if (!audioPath) {
    console.warn(`Audio file not found for key: ${soundKey}`)
    return
  }

  try {
    const audio = new Audio(audioPath)
    audio.volume = Math.max(0, Math.min(1, volume)) // 确保音量在0-1之间

    // 设置音频属性以确保后台播放
    audio.preload = 'auto'

    // 尝试播放音频，即使在后台
    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 音频播放成功
        })
        .catch((error) => {
          console.error('Failed to play audio:', error)
          // 如果自动播放失败，可能是由于浏览器的自动播放策略
          // 在实际应用中，用户交互后音频应该能正常播放
        })
    }
  } catch (error) {
    console.error('Error creating audio:', error)
  }
}

// 预加载音效文件
export const preloadAudio = (soundKeys: string[]) => {
  if (typeof window === 'undefined') return

  soundKeys.forEach((key) => {
    const audioPath = AUDIO_FILE_MAP[key as keyof typeof AUDIO_FILE_MAP]
    if (audioPath) {
      const audio = new Audio(audioPath)
      audio.preload = 'auto'
    }
  })
}
