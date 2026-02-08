import { useRef, useState } from 'react'
import { Anchor, AnchorLink } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

// Get the main scroll container from the layout
const getMainContainer = () => {
  // The layout uses a scrollable div inside main
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

const basicSnippet = `<Anchor>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
  <AnchorLink href="#section3" title="Section 3" />
</Anchor>`

const horizontalSnippet = `<Anchor direction="horizontal" getContainer={getMainContainer}>
  <AnchorLink href="#demo-basic" title="基本用法" />
  <AnchorLink href="#demo-horizontal" title="水平方向" />
  <AnchorLink href="#demo-container" title="自定义容器" />
  <AnchorLink href="#demo-nested" title="嵌套锚点" />
</Anchor>`

const nestedSnippet = `<Anchor>
  <AnchorLink href="#chapter1" title="第一章">
    <AnchorLink href="#section1-1" title="1.1 小节" />
    <AnchorLink href="#section1-2" title="1.2 小节" />
  </AnchorLink>
  <AnchorLink href="#chapter2" title="第二章" />
</Anchor>`

const inkSnippet = `<Anchor showInkInFixed offsetTop={80}>
  <AnchorLink href="#part1" title="Part 1" />
  <AnchorLink href="#part2" title="Part 2" />
</Anchor>

// affix=false 时墨水指示器默认可见
<Anchor affix={false}>
  <AnchorLink href="#part1" title="Part 1" />
</Anchor>`

const eventsSnippet = `<Anchor
  onClick={(e, href) => console.log('Clicked:', href)}
  onChange={(activeLink) => console.log('Active:', activeLink)}
  targetOffset={60}>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
</Anchor>`

const targetSnippet = `const scrollContainerRef = useRef<HTMLDivElement>(null)
const getScrollContainer = () => scrollContainerRef.current || window

<div ref={scrollContainerRef} className="scroll-container">
  <div id="target-section1">...</div>
  <div id="target-section2">...</div>
</div>
<Anchor getContainer={getScrollContainer}>
  <AnchorLink href="#target-section1" title="Section 1" />
  <AnchorLink href="#target-section2" title="Section 2" />
</Anchor>`

export default function AnchorDemo() {
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
    setLastEvent(`激活: ${activeLink}`)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Anchor 锚点</h1>
        <p className="text-gray-600">用于跳转到页面指定位置的导航组件。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧内容区 */}
        <div className="lg:col-span-3 space-y-8">
          <div id="demo-basic" className="scroll-mt-20">
            <DemoBlock title="基本用法" description="最简单的锚点导航。" code={basicSnippet}>
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  点击右侧的锚点链接可以滚动到对应的内容区域。当前选中的锚点会高亮显示。
                </p>
              </div>
            </DemoBlock>
          </div>

          <div id="demo-horizontal" className="scroll-mt-20">
            <DemoBlock title="水平方向" description="锚点可以水平排列。" code={horizontalSnippet}>
              <div className="p-6 bg-gray-50 rounded-lg">
                <Anchor
                  direction="horizontal"
                  getContainer={getMainContainer}
                  onChange={handleChange}>
                  <AnchorLink href="#demo-basic" title="基本用法" />
                  <AnchorLink href="#demo-horizontal" title="水平方向" />
                  <AnchorLink href="#demo-container" title="自定义容器" />
                  <AnchorLink href="#demo-nested" title="嵌套锚点" />
                </Anchor>
                <p className="mt-4 text-sm text-gray-500">水平锚点适合用于页面顶部的快速导航。</p>
              </div>
            </DemoBlock>
          </div>

          <div id="demo-container" className="scroll-mt-20">
            <DemoBlock title="自定义容器" description="可以指定滚动容器。" code={targetSnippet}>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  <div
                    id="custom-scroll-container"
                    ref={scrollContainerRef}
                    className="flex-1 h-64 overflow-auto border border-gray-200 rounded-lg bg-white">
                    <div id="target-section1" className="p-4 h-48 bg-blue-50">
                      <h3 className="font-semibold text-blue-700">Section 1</h3>
                      <p className="text-gray-600 mt-2">这是 Section 1 的内容区域。</p>
                    </div>
                    <div id="target-section2" className="p-4 h-48 bg-green-50">
                      <h3 className="font-semibold text-green-700">Section 2</h3>
                      <p className="text-gray-600 mt-2">这是 Section 2 的内容区域。</p>
                    </div>
                    <div id="target-section3" className="p-4 h-48 bg-purple-50">
                      <h3 className="font-semibold text-purple-700">Section 3</h3>
                      <p className="text-gray-600 mt-2">这是 Section 3 的内容区域。</p>
                    </div>
                    <div id="target-section4" className="p-4 h-48 bg-orange-50">
                      <h3 className="font-semibold text-orange-700">Section 4</h3>
                      <p className="text-gray-600 mt-2">这是 Section 4 的内容区域。</p>
                    </div>
                  </div>
                  <div className="w-40">
                    <Anchor getContainer={getScrollContainer}>
                      <AnchorLink href="#target-section1" title="Section 1" />
                      <AnchorLink href="#target-section2" title="Section 2" />
                      <AnchorLink href="#target-section3" title="Section 3" />
                      <AnchorLink href="#target-section4" title="Section 4" />
                    </Anchor>
                  </div>
                </div>
              </div>
            </DemoBlock>
          </div>

          <div id="demo-nested" className="scroll-mt-20">
            <DemoBlock title="嵌套锚点" description="支持多级嵌套的锚点。" code={nestedSnippet}>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex gap-8">
                  <div className="flex-1">
                    <p className="text-gray-600 mb-4">
                      嵌套锚点可以用于展示文档的层级结构，如章节和小节。
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>• 第一章 - Chapter 1</p>
                      <p className="pl-4">• 1.1 小节 - Section 1.1</p>
                      <p className="pl-4">• 1.2 小节 - Section 1.2</p>
                      <p>• 第二章 - Chapter 2</p>
                      <p className="pl-4">• 2.1 小节 - Section 2.1</p>
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
            </DemoBlock>
          </div>

          <div id="demo-ink" className="scroll-mt-20">
            <DemoBlock
              title="墨水指示器"
              description="固定模式下通过 showInkInFixed 显示墨水指示器；非固定模式默认可见。"
              code={inkSnippet}>
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
            </DemoBlock>
          </div>

          <div id="demo-events" className="scroll-mt-20">
            <DemoBlock
              title="事件处理"
              description="监听 onClick 和 onChange 事件，可配合 targetOffset 使用。"
              code={eventsSnippet}>
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
            </DemoBlock>
          </div>
        </div>

        {/* 右侧固定锚点导航 */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <h4 className="text-sm font-semibold text-gray-500 mb-4">页面导航</h4>
            <Anchor getContainer={getMainContainer} onChange={handleChange}>
              <AnchorLink href="#demo-basic" title="基本用法" />
              <AnchorLink href="#demo-horizontal" title="水平方向" />
              <AnchorLink href="#demo-container" title="自定义容器" />
              <AnchorLink href="#demo-nested" title="嵌套锚点" />
              <AnchorLink href="#demo-ink" title="墨水指示器" />
              <AnchorLink href="#demo-events" title="事件处理" />
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  )
}
