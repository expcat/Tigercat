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
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex gap-8 items-start">
          <div className="flex-1">
            <Anchor
              affix={false}
              getContainer={getMainContainer}
              targetOffset={60}
              onClick={handleDemoClick}
              onChange={handleDemoChange}>
              <AnchorLink href="#demo-basic" title="基本用法" />
              <AnchorLink href="#demo-horizontal" title="水平方向" />
              <AnchorLink href="#demo-container" title="自定义容器" />
            </Anchor>
          </div>
          <div className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-sm">
            <p className="text-gray-500 mb-1">最近事件：</p>
            <p className="font-mono text-gray-800">{lastEvent || '（点击或滚动触发）'}</p>
          </div>
        </div>
      </div>
    </>
  )
}
