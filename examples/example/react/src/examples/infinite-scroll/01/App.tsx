import { useState } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react/InfiniteScroll'

export default function App() {
  const [items, setItems] = useState(() => Array.from({ length: 3 }, (_, index) => index + 1))
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
      height={288}
      onLoadMore={loadMore}
      className="rounded border border-[var(--tiger-border,#e5e7eb)]">
      {items.map((item) => (
        <div key={item} className="border-b border-[var(--tiger-border,#e5e7eb)] px-4 py-3">
          项目 {item}
        </div>
      ))}
    </InfiniteScroll>
  )
}
