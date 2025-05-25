import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function GuidePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Back to Timer</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">使用指南</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">
            欢迎来到高效学习法计时器！
          </h2>

          <p className="text-muted-foreground mb-6">
            你是否正在寻找提升学习和工作效率的方法？本网站基于一个经科学理论支持的强大方法，旨在帮助你提高专注力、记忆力，并实现更长时间的高效学习。
          </p>

          <h3 className="text-xl font-semibold mb-3">核心方法介绍</h3>
          <p>这个方法非常简单易行。主要步骤如下：</p>
          <ol className="space-y-2 mb-6">
            <li>
              <strong>设置随机提示音：</strong>{' '}
              在你专注学习或工作的过程中，工具会按照设定的时间范围随机发出提示音。
            </li>
            <li>
              <strong>即刻短暂休息：</strong>{' '}
              听到提示音时，无论你正在做什么，请立即闭上眼睛休息大约10秒钟。
            </li>
            <li>
              <strong>继续专注：</strong>{' '}
              短暂休息后，立即回到你之前的任务，继续专注。
            </li>
            <li>
              <strong>周期性长休息：</strong>{' '}
              按照这个模式持续专注一段时间（例如推荐的90分钟），然后进行一次较长的休息（例如推荐的20分钟），如此循环。
            </li>
          </ol>

          <h3 className="text-xl font-semibold mb-3">为什么这个方法有效？</h3>
          <p className="mb-6">
            简单来说，短暂的休息能触发大脑的神经重放现象，帮助复习和巩固之前学习的内容，效率极高。随机的提示音利用了行为心理学中的变比率强化原理，能帮助你更容易地坚持下去。而周期性的长休息则符合大脑的最佳持续工作时长规律。
          </p>
          <p className="mb-6">
            通过实践，这个方法可以显著提升你的学习效率，让你更专注，记忆力及信息处理能力都会得到增强。
          </p>

          <h3 className="text-xl font-semibold mb-3">本网站提供的功能</h3>
          <p>
            为了方便你应用这个方法，本网站提供了一个易于使用的计时器工具。你可以根据自己的需求和偏好，自由地：
          </p>
          <ul className="space-y-2 mb-6">
            <li>自定义专注时长：设定你想要持续专注多久。</li>
            <li>自定义随机音的间隔：调整提示音随机响起的间隔范围。</li>
            <li>自定义休息时长：设定专注周期结束后休息的时间。</li>
            <li>自定义提示音：选择你喜欢的提示声音。</li>
          </ul>

          <div className="mt-8">
            <p className="mb-4">立即开始使用，体验前所未有的专注与效率吧！</p>
            <Link href="/">
              <Button size="lg">开始自律了</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
