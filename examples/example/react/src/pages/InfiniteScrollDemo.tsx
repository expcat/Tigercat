import { useState, useCallback } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore}>
  {items.map(i => <div key={i} className="px-4 py-3 border-b">项目 {i}</div>)}
</InfiniteScroll>`

const customSnippet = `<InfiniteScroll hasMore={false} loadingText="拼命加载中..." endText="— 到底了 —">
  {items.map(i => <div key={i}>项目 {i}</div>)}
</InfiniteScroll>`

const InfiniteScrollDemo: React.FC = () => {
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
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">InfiniteScroll 无限滚动</h1>
      <p className="text-gray-500 mb-8">滚动到底部自动加载更多内容。</p>

      <DemoBlock title="基础用法" description="滚动到底部触发 onLoadMore" code={basicSnippet}>
        <div style={{ height: 300, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore}>
            {items.map((i) => (
              <div key={i} className="px-4 py-3 border-b">项目 {i}</div>
            ))}
          </InfiniteScroll>
        </div>
      </DemoBlock>

      <DemoBlock title="自定义文案" description="loadingText / endText" code={customSnippet}>
        <div style={{ height: 200, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <InfiniteScroll hasMore={false} loadingText="拼命加载中..." endText="— 到底了 —">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="px-4 py-3 border-b">项目 {i + 1}</div>
            ))}
          </InfiniteScroll>
        </div>
      </DemoBlock>
    </div>
  )
}

export default InfiniteScrollDemo
