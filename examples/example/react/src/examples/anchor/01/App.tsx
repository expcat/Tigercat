import { AnchorLink } from '@expcat/tigercat-react/AnchorLink'
import { useRef, useState } from 'react'
import { Anchor } from '@expcat/tigercat-react/Anchor'

// Get the main scroll container from the layout
const getMainContainer = () => {
  // The layout uses a scrollable div inside main
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Use getElementById to always get fresh DOM reference (handles HMR)
  const getScrollContainer = () => document.getElementById('custom-scroll-container') || window

  const handleChange = (href: string) => {
    console.log('Anchor changed:', href)
  }

  const [lastEvent, setLastEvent] = useState('')

  const handleDemoClick = (_e: React.MouseEvent, href: string) => {
    setLastEvent(`点击: ${href}`)
  }

  const handleDemoChange = (activeLink: string) => {
    window.setTimeout(() => setLastEvent(`激活: ${activeLink}`), 0)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              点击右侧的锚点链接可以滚动到对应的内容区域。当前选中的锚点会高亮显示。
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3
            id="demo-horizontal"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 scroll-mt-20">
            水平方向
          </h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Anchor direction="horizontal" getContainer={getMainContainer} onChange={handleChange}>
              <AnchorLink href="#demo-basic" title="基本用法" />
              <AnchorLink href="#demo-horizontal" title="水平方向" />
              <AnchorLink href="#demo-container" title="自定义容器" />
              <AnchorLink href="#demo-nested" title="嵌套锚点" />
            </Anchor>
            <p className="mt-4 text-sm text-gray-500">水平锚点适合用于页面顶部的快速导航。</p>
          </div>
        </div>
      </div>
    </>
  )
}
