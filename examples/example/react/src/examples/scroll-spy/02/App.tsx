import { useMemo, useRef, useState } from 'react'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import { type ScrollSpyItem } from '@expcat/tigercat-react'

const getMainContainer = () => {
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

const pageItems: ScrollSpyItem[] = [
  { key: 'overview', href: '#scrollspy-overview', label: '概览' },
  { key: 'workflow', href: '#scrollspy-workflow', label: '工作流' },
  {
    key: 'api',
    href: '#scrollspy-api',
    label: 'API',
    children: [{ key: 'events', href: '#scrollspy-events', label: '事件' }]
  }
]

export default function App() {
  const [activeKey, setActiveKey] = useState<string | number>('overview')

  const [lastEvent, setLastEvent] = useState('等待滚动或点击')

  const containerRef = useRef<HTMLDivElement>(null)

  const containerItems = useMemo<ScrollSpyItem[]>(
    () => [
      { key: 'audit', href: '#spy-audit', label: '审计' },
      { key: 'release', href: '#spy-release', label: '发布' },
      { key: 'monitor', href: '#spy-monitor', label: '监控' }
    ],
    []
  )

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div
          ref={containerRef}
          className="h-72 overflow-auto rounded border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <section id="spy-audit" className="h-56 p-5 bg-blue-50 dark:bg-blue-950/30">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">审计</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              查看配置、权限和变更记录。
            </p>
          </section>
          <section id="spy-release" className="h-56 p-5 bg-green-50 dark:bg-green-950/30">
            <h3 className="font-semibold text-green-800 dark:text-green-200">发布</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              确认版本、构建产物和发布门禁。
            </p>
          </section>
          <section id="spy-monitor" className="h-56 p-5 bg-amber-50 dark:bg-amber-950/30">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">监控</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              跟踪运行状态和异常通知。
            </p>
          </section>
        </div>
        <ScrollSpy
          items={containerItems}
          getContainer={() => containerRef.current || window}
          onActiveKeyChange={(_key, item, payload) =>
            setLastEvent(`${item.label} / ${payload.source}`)
          }
        />
      </div>
      <p className="mt-3 text-sm text-gray-500">最近事件：{lastEvent}</p>
    </>
  )
}
