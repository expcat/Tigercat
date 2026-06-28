import { useMemo, useRef, useState } from 'react'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import { type ScrollSpyItem } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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

const basicSnippet = `const items = [
  { key: 'overview', href: '#overview', label: '概览' },
  { key: 'workflow', href: '#workflow', label: '工作流' }
]

<ScrollSpy items={items} getContainer={getMainContainer} targetOffset={80} />`

const horizontalSnippet = `<ScrollSpy
  direction="horizontal"
  items={items}
  activeKey={activeKey}
  onChange={setActiveKey}
/>
`

const containerSnippet = `const containerRef = useRef<HTMLDivElement>(null)

<div ref={containerRef} className="h-72 overflow-auto">
  <section id="audit">...</section>
  <section id="release">...</section>
</div>

<ScrollSpy
  items={items}
  getContainer={() => containerRef.current || window}
/>
`

export default function ScrollSpyDemo() {
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
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ScrollSpy 滚动监听</h1>
        <p className="text-gray-600 dark:text-gray-400">
          监听内容滚动并自动高亮当前导航项，适合文档目录、长表单和设置页。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        <div className="space-y-8">
          <DemoBlock
            title="基本用法"
            description="根据页面滚动位置同步当前导航项。"
            code={basicSnippet}>
            <div className="space-y-6">
              <section
                id="scrollspy-overview"
                className="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">概览</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ScrollSpy 使用 href 与页面 section 关联，滚动到对应区域时自动切换 activeKey。
                </p>
              </section>
              <section
                id="scrollspy-workflow"
                className="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">工作流</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  点击导航项会阻止默认跳转，改用平滑滚动定位，避免页面状态突然跳变。
                </p>
              </section>
              <section
                id="scrollspy-api"
                className="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">API</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  items 支持 children，可渲染一层或多层目录结构，disabled 项不会参与滚动监听。
                </p>
              </section>
              <section
                id="scrollspy-events"
                className="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">事件</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  onChange 会返回 activeKey、item 和 source，业务侧可以记录用户点击或滚动来源。
                </p>
              </section>
            </div>
          </DemoBlock>

          <DemoBlock
            title="水平导航"
            description="适合页内顶部导航或紧凑筛选区域。"
            code={horizontalSnippet}>
            <div className="space-y-4">
              <ScrollSpy
                direction="horizontal"
                items={pageItems}
                activeKey={activeKey}
                getContainer={getMainContainer}
                onChange={(key) => setActiveKey(key)}
              />
              <p className="text-sm text-gray-500">当前 activeKey：{String(activeKey)}</p>
            </div>
          </DemoBlock>

          <DemoBlock
            title="自定义滚动容器"
            description="指定内部容器作为滚动监听目标。"
            code={containerSnippet}>
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
                onChange={(_key, item, payload) =>
                  setLastEvent(`${item.label} / ${payload.source}`)
                }
              />
            </div>
            <p className="mt-3 text-sm text-gray-500">最近事件：{lastEvent}</p>
          </DemoBlock>
        </div>

        <aside className="hidden lg:block">
          <ScrollSpy
            sticky
            items={pageItems}
            getContainer={getMainContainer}
            targetOffset={80}
            ariaLabel="页面目录"
          />
        </aside>
      </div>
    </div>
  )
}
