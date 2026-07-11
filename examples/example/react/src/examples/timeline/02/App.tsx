import { Timeline } from '@expcat/tigercat-react/Timeline'
import type { TimelineItem } from '@expcat/tigercat-core'

interface ReleaseItem extends TimelineItem {
  title: string
  detail: string
}

const items: ReleaseItem[] = [
  { key: 1, label: 'v1.0', title: '首次发布', detail: '完成核心组件。' },
  { key: 2, label: 'v1.1', title: '体验优化', detail: '补充主题和无障碍支持。' }
]

export default function App() {
  return (
    <Timeline
      items={items}
      renderDot={(item) => (
        <span className="block h-3 w-3 rounded-full bg-[var(--tiger-primary,#2563eb)]">
          <span className="sr-only">{String(item.label)}</span>
        </span>
      )}
      renderItem={(item) => {
        const release = item as ReleaseItem
        return (
          <div>
            <strong>{release.title}</strong>
            <p className="text-sm text-gray-500">{release.detail}</p>
          </div>
        )
      }}
    />
  )
}
