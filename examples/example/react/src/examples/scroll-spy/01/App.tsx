import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import type { ScrollSpyItem } from '@expcat/tigercat-react'

const items: ScrollSpyItem[] = [
  { key: 'overview', href: '#spy-overview', label: '概览' },
  { key: 'workflow', href: '#spy-workflow', label: '工作流' }
]

export default function App() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
      <div>
        <section id="spy-overview" className="h-52 bg-blue-50 p-4">
          概览
        </section>
        <section id="spy-workflow" className="h-52 bg-green-50 p-4">
          工作流
        </section>
      </div>
      <ScrollSpy items={items} sticky direction="vertical" />
    </div>
  )
}
