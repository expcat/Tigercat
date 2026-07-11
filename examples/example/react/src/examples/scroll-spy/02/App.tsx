import { useRef, useState } from 'react'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import type { ScrollSpyItem } from '@expcat/tigercat-react'

const items: ScrollSpyItem[] = [
  { key: 'audit', href: '#spy-audit', label: '审计' },
  { key: 'release', href: '#spy-release', label: '发布' }
]

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeLabel, setActiveLabel] = useState('审计')

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_160px]">
        <div ref={containerRef} className="h-64 overflow-auto rounded border">
          <section id="spy-audit" className="h-52 bg-blue-50 p-4">
            审计
          </section>
          <section id="spy-release" className="h-52 bg-green-50 p-4">
            发布
          </section>
        </div>
        <ScrollSpy
          items={items}
          getContainer={() => containerRef.current ?? window}
          onActiveKeyChange={(_key, item) => setActiveLabel(item.label)}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">当前：{activeLabel}</p>
    </div>
  )
}
