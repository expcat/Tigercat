import { useState } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react/InfiniteScroll'

const initialItems = Array.from({ length: 8 }, (_, index) => index + 1)

export default function App() {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(false)
  const hasMore = items.length < 20

  const loadMore = () => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => {
      setItems((current) => [
        ...current,
        ...Array.from({ length: 4 }, (_, index) => current.length + index + 1)
      ])
      setLoading(false)
    }, 400)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        横向滚动到右侧边界，观察新卡片和结束状态。
      </p>
      <InfiniteScroll
        direction="horizontal"
        hasMore={hasMore}
        loading={loading}
        loadingText="正在加载卡片..."
        endText="已加载全部卡片"
        onLoadMore={loadMore}
        className="h-44 gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        {items.map((item) => (
          <article
            key={item}
            className="flex w-36 shrink-0 flex-col justify-between rounded-lg bg-blue-50 p-4 text-blue-950 dark:bg-blue-950 dark:text-blue-100">
            <span className="text-xs font-medium uppercase tracking-wide">Card</span>
            <strong className="text-2xl">{item}</strong>
            <span className="text-xs opacity-70">横向项目</span>
          </article>
        ))}
      </InfiniteScroll>
    </div>
  )
}
