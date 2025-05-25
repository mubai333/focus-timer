'use client'

import { useTimer } from '@/context/timer-context'
import { Button } from '@/components/ui/button'

export function DebugSettings() {
  const { settings, updateSettings } = useTimer()

  const testSave = () => {
    const testSettings = {
      focusDuration: 45,
      shortBreakSound: 'water-drop',
      endSound: 'meditation-bell',
    }
    updateSettings(testSettings)
    alert('测试设置已保存！刷新页面查看是否保持。')
  }

  const checkStorage = () => {
    const stored = localStorage.getItem('focus-timer-settings')
    alert(`localStorage 内容: ${stored || '空'}`)
  }

  return (
    <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 mb-4">
      <h3 className="text-sm font-semibold mb-2">🔧 调试工具</h3>
      <div className="flex gap-2 text-xs">
        <Button size="sm" onClick={testSave}>
          测试保存
        </Button>
        <Button size="sm" variant="outline" onClick={checkStorage}>
          查看存储
        </Button>
      </div>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        专注时长: {settings.focusDuration}分钟 | 音效:{' '}
        {settings.shortBreakSound}
      </div>
    </div>
  )
}
