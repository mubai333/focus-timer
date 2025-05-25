'use client'

import { useState, useEffect } from 'react'
import { useTimer } from '@/context/timer-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AUDIO_OPTIONS, playAudio } from '@/lib/audio-utils'

export function SettingsPanel() {
  const { settings, updateSettings, state } = useTimer()
  const [isOpen, setIsOpen] = useState(false)

  const [focusDuration, setFocusDuration] = useState(
    settings.focusDuration.toString()
  )
  const [shortBreakMinInterval, setShortBreakMinInterval] = useState(
    settings.shortBreakMinInterval.toString()
  )
  const [shortBreakMaxInterval, setShortBreakMaxInterval] = useState(
    settings.shortBreakMaxInterval.toString()
  )
  const [longBreakDuration, setLongBreakDuration] = useState(
    settings.longBreakDuration.toString()
  )

  useEffect(() => {
    setFocusDuration(settings.focusDuration.toString())
    setShortBreakMinInterval(settings.shortBreakMinInterval.toString())
    setShortBreakMaxInterval(settings.shortBreakMaxInterval.toString())
    setLongBreakDuration(settings.longBreakDuration.toString())
  }, [settings])

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const handleSoundChange = (
    soundType: 'shortBreakSound' | 'endSound',
    value: string
  ) => {
    updateSettings({ [soundType]: value })
  }

  const handleSave = () => {
    const newSettings = {
      focusDuration: parseInt(focusDuration) || 90,
      shortBreakMinInterval: parseInt(shortBreakMinInterval) || 3,
      shortBreakMaxInterval: parseInt(shortBreakMaxInterval) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 20,
      shortBreakSound: settings.shortBreakSound,
      endSound: settings.endSound,
    }

    updateSettings(newSettings)
    setIsOpen(false) // Close the panel after saving
  }

  const shouldDisableSettings =
    state !== 'idle' &&
    state !== 'focusComplete' &&
    state !== 'longBreakComplete'

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between mb-2"
        onClick={togglePanel}
      >
        <div className="flex items-center gap-2">
          <Settings size={16} />
          <span>Timer Settings</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customize Your Timer</CardTitle>
                <CardDescription>
                  Adjust settings to match your preferred work rhythm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="focusDuration">
                      Focus Duration (minutes)
                    </Label>
                    <Input
                      id="focusDuration"
                      type="number"
                      min="1"
                      max="240"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(e.target.value)}
                      disabled={shouldDisableSettings}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="shortBreakMinInterval">
                        Short Break Min Interval (minutes)
                      </Label>
                      <Input
                        id="shortBreakMinInterval"
                        type="number"
                        min="1"
                        max="60"
                        value={shortBreakMinInterval}
                        onChange={(e) =>
                          setShortBreakMinInterval(e.target.value)
                        }
                        disabled={shouldDisableSettings}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shortBreakMaxInterval">
                        Short Break Max Interval (minutes)
                      </Label>
                      <Input
                        id="shortBreakMaxInterval"
                        type="number"
                        min="1"
                        max="60"
                        value={shortBreakMaxInterval}
                        onChange={(e) =>
                          setShortBreakMaxInterval(e.target.value)
                        }
                        disabled={shouldDisableSettings}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="longBreakDuration">
                      Long Break Duration (minutes)
                    </Label>
                    <Input
                      id="longBreakDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={longBreakDuration}
                      onChange={(e) => setLongBreakDuration(e.target.value)}
                      disabled={shouldDisableSettings}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="shortBreakSound">Short Break Sound</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings.shortBreakSound}
                        onValueChange={(value) =>
                          handleSoundChange('shortBreakSound', value)
                        }
                        disabled={shouldDisableSettings}
                      >
                        <SelectTrigger id="shortBreakSound" className="flex-1">
                          <SelectValue placeholder="Select a sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIO_OPTIONS.shortBreakSounds.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              <div className="flex flex-col">
                                <span>{sound.label}</span>
                                {/* <span className="text-xs text-muted-foreground">
                                  {sound.description}
                                </span> */}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => playAudio(settings.shortBreakSound, 0.6)}
                        disabled={shouldDisableSettings}
                        title="试听音效"
                      >
                        <Volume2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endSound">End Sound</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings.endSound}
                        onValueChange={(value) =>
                          handleSoundChange('endSound', value)
                        }
                        disabled={shouldDisableSettings}
                      >
                        <SelectTrigger id="endSound" className="flex-1">
                          <SelectValue placeholder="Select a sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIO_OPTIONS.endSounds.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              <div className="flex flex-col">
                                <span>{sound.label}</span>
                                {/* <span className="text-xs text-muted-foreground">
                                  {sound.description}
                                </span> */}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => playAudio(settings.endSound, 0.7)}
                        disabled={shouldDisableSettings}
                        title="试听音效"
                      >
                        <Volume2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={shouldDisableSettings}
                    className="mt-2"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
