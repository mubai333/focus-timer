import { TimerDisplay } from '@/components/timer-display'
import { TimerControls } from '@/components/timer-controls'
import { SettingsPanel } from '@/components/settings-panel'
import { TimerProvider } from '@/context/timer-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Info } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12">
      <div className="absolute top-4 right-4 flex gap-2">
        <Link href="/guide">
          <Button variant="ghost" size="icon">
            <Info className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Usage Guide</span>
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Focus Timer</h1>
        <p className="text-muted-foreground text-center max-w-xs mb-8">
          Stay productive with timed focus sessions and regular short breaks
        </p>

        <TimerProvider>
          <SettingsPanel />

          <div className="w-full bg-card rounded-lg shadow-lg p-6 md:p-8">
            <TimerDisplay />
            <TimerControls />
          </div>
        </TimerProvider>
      </div>
    </main>
  )
}
