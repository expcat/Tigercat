import { useRef } from 'react'
import { BackTop } from '@expcat/tigercat-react/BackTop'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative h-64 overflow-auto rounded border">
      <div className="h-[900px] p-4">
        <p>在此容器内向下滚动。</p>
      </div>
      <BackTop
        target={() => containerRef.current ?? window}
        visibilityHeight={100}
        position="sticky"
        duration={0}
      />
    </div>
  )
}
