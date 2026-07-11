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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">嵌套锚点</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-8">
              <div className="flex-1">
                <p className="text-gray-600 mb-4">
                  嵌套锚点可以用于展示文档的层级结构，如章节和小节。
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p id="chapter1" className="scroll-mt-20">
                    • 第一章 - Chapter 1
                  </p>
                  <p id="section1-1" className="pl-4 scroll-mt-20">
                    • 1.1 小节 - Section 1.1
                  </p>
                  <p id="section1-2" className="pl-4 scroll-mt-20">
                    • 1.2 小节 - Section 1.2
                  </p>
                  <p id="chapter2" className="scroll-mt-20">
                    • 第二章 - Chapter 2
                  </p>
                  <p id="section2-1" className="pl-4 scroll-mt-20">
                    • 2.1 小节 - Section 2.1
                  </p>
                </div>
              </div>
              <div className="w-48">
                <Anchor>
                  <AnchorLink href="#chapter1" title="第一章">
                    <AnchorLink href="#section1-1" title="1.1 介绍" />
                    <AnchorLink href="#section1-2" title="1.2 安装" />
                  </AnchorLink>
                  <AnchorLink href="#chapter2" title="第二章">
                    <AnchorLink href="#section2-1" title="2.1 基础用法" />
                  </AnchorLink>
                </Anchor>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3
            id="demo-ink"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 scroll-mt-20">
            墨水指示器
          </h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-8">
              <div className="flex-1">
                <p className="text-gray-600 mb-2">
                  <code>affix=false</code> 时墨水指示器默认显示：
                </p>
                <Anchor affix={false} getContainer={getMainContainer}>
                  <AnchorLink href="#demo-basic" title="基本用法" />
                  <AnchorLink href="#demo-horizontal" title="水平方向" />
                </Anchor>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 mb-2">
                  <code>showInkInFixed</code> 在固定模式下也显示：
                </p>
                <Anchor showInkInFixed getContainer={getMainContainer}>
                  <AnchorLink href="#demo-container" title="自定义容器" />
                  <AnchorLink href="#demo-nested" title="嵌套锚点" />
                </Anchor>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
