import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ScrollArea } from '@expcat/tigercat-react/ScrollArea'
import type { ScrollAreaInstance } from '@expcat/tigercat-core'

const messages = Array.from({ length: 30 }, (_, index) => `消息 ${index + 1}`)

export default function App() {
  const areaRef = useRef<ScrollAreaInstance>(null)
  const [progress, setProgress] = useState(0)

  return (
    <div className="w-full max-w-md space-y-3">
      <ScrollArea
        ref={areaRef}
        maxHeight={200}
        ariaLabel="消息列表"
        className="rounded-lg border border-gray-200 dark:border-gray-700"
        onScroll={(detail) => setProgress(Math.round(detail.state.y.progress * 100))}>
        <ul className="px-4">
          {messages.map((message) => (
            <li key={message} className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {message}
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => areaRef.current?.scrollToTop('smooth')}>
          回到顶部
        </Button>
        <Button size="sm" onClick={() => areaRef.current?.scrollToBottom('smooth')}>
          滚动到底部
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => areaRef.current?.scrollTo({ top: 200 })}>
          跳到 200px
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">滚动进度：{progress}%</p>
    </div>
  )
}
