import { useState } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react/InfiniteScroll'

export default function App() {
  const [items, setItems] = useState(() => Array.from({ length: 10 }, (_, index) => index + 1))
  const [loading, setLoading] = useState(false)
  const hasMore = items.length < 30

  const loadMore = () => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => {
      setItems((current) => [
        ...current,
        ...Array.from({ length: 5 }, (_, index) => current.length + index + 1)
      ])
      setLoading(false)
    }, 400)
  }

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loading={loading}
      loadingText="正在加载更多..."
      endText="没有更多数据了"
      onLoadMore={loadMore}
      className="h-72 rounded border border-gray-200">
      {items.map((item) => (
        <div key={item} className="border-b px-4 py-3">
          项目 {item}
        </div>
      ))}
    </InfiniteScroll>
  )
}
