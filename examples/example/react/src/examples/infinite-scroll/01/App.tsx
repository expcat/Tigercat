import { useState, useCallback } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react/InfiniteScroll'

export default function App() {
  const [items, setItems] = useState(() => Array.from({ length: 20 }, (_, i) => i + 1))

  const [loading, setLoading] = useState(false)

  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(() => {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      setItems((prev) => {
        const next = [...prev, ...Array.from({ length: 10 }, (_, i) => prev.length + i + 1)]
        if (next.length >= 50) setHasMore(false)
        return next
      })
      setLoading(false)
    }, 800)
  }, [loading])

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">滚动到底部触发 onLoadMore</p>
          <InfiniteScroll
            hasMore={hasMore}
            loading={loading}
            loadingText="正在加载更多..."
            endText="没有更多数据了"
            onLoadMore={loadMore}
            className="h-[300px] border border-gray-200 rounded-lg">
            {items.map((i) => (
              <div key={i} className="px-4 py-3 border-b">
                项目 {i}
              </div>
            ))}
          </InfiniteScroll>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义文案</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">loadingText / endText</p>
          <InfiniteScroll
            hasMore={false}
            loadingText="拼命加载中..."
            endText="— 到底了 —"
            className="h-[200px] border border-gray-200 rounded-lg">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="px-4 py-3 border-b">
                项目 {i + 1}
              </div>
            ))}
          </InfiniteScroll>
        </section>
      </div>
    </>
  )
}
