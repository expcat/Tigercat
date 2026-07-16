import { useState } from 'react'
import { NotificationCenter } from '@expcat/tigercat-react/NotificationCenter'
import type { NotificationItem, NotificationReadFilter } from '@expcat/tigercat-core'

type ViewState = 'content' | 'loading' | 'empty'

const initialItems: NotificationItem[] = [
  {
    id: 1,
    title: '发布检查已通过',
    description: 'v2.0.4 的本地发布门禁全部通过。',
    time: '11:20',
    type: '产品',
    read: false
  },
  {
    id: 2,
    title: '示例审查已完成',
    description: 'R32 的三个高级组件已经补齐展示。',
    time: '10:05',
    type: '产品',
    read: true
  },
  {
    id: 3,
    title: '维护窗口提醒',
    description: '今晚 23:00 将进行例行维护。',
    time: '昨天',
    type: '系统',
    read: false
  }
]

const viewOptions: Array<{ value: ViewState; label: string }> = [
  { value: 'content', label: '通知列表' },
  { value: 'loading', label: '加载状态' },
  { value: 'empty', label: '空状态' }
]

export default function App() {
  const [items, setItems] = useState(initialItems)
  const [activeGroupKey, setActiveGroupKey] = useState<string | number>('产品')
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>('all')
  const [view, setView] = useState<ViewState>('content')

  const handleItemReadChange = (item: NotificationItem, read: boolean) => {
    setItems((current) =>
      current.map((candidate) => (candidate.id === item.id ? { ...candidate, read } : candidate))
    )
  }

  const handleMarkAllRead = (
    _groupKey: string | number | undefined,
    groupItems: NotificationItem[]
  ) => {
    const ids = new Set(groupItems.map((item) => item.id))
    setItems((current) =>
      current.map((item) => (ids.has(item.id) ? { ...item, read: true } : item))
    )
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="通知中心展示状态">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              view === option.value
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
            aria-pressed={view === option.value}
            onClick={() => setView(option.value)}>
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        当前分组：{String(activeGroupKey)}；筛选：{readFilter}
      </p>

      <NotificationCenter
        items={view === 'empty' ? [] : items}
        groupBy={(item) => String(item.type ?? '其他')}
        groupOrder={['产品', '系统']}
        activeGroupKey={activeGroupKey}
        readFilter={readFilter}
        loading={view === 'loading'}
        loadingText="正在同步通知..."
        emptyText="当前没有通知"
        onGroupChange={setActiveGroupKey}
        onReadFilterChange={setReadFilter}
        onItemReadChange={handleItemReadChange}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  )
}
