import React, { useRef } from 'react'
import { Anchor, AnchorLink } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Anchor>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
  <AnchorLink href="#section3" title="Section 3" />
</Anchor>`

const horizontalSnippet = `<Anchor direction="horizontal">
  <AnchorLink href="#intro" title="介绍" />
  <AnchorLink href="#usage" title="使用方法" />
  <AnchorLink href="#api" title="API" />
</Anchor>`

const nestedSnippet = `<Anchor>
  <AnchorLink href="#chapter1" title="第一章">
    <AnchorLink href="#section1-1" title="1.1 小节" />
    <AnchorLink href="#section1-2" title="1.2 小节" />
  </AnchorLink>
  <AnchorLink href="#chapter2" title="第二章" />
</Anchor>`

const targetSnippet = `<div ref={scrollContainer} className="scroll-container">
  <div id="target-section1">...</div>
  <div id="target-section2">...</div>
</div>
<Anchor target={() => scrollContainer.current}>
  <AnchorLink href="#target-section1" title="Section 1" />
  <AnchorLink href="#target-section2" title="Section 2" />
</Anchor>`

export default function AnchorDemo() {
  const scrollContainer = useRef<HTMLDivElement>(null)

  const handleChange = (href: string) => {
    console.log('Anchor changed:', href)
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
          <DemoBlock title="基本用法" description="最简单的锚点导航。" code={basicSnippet}>
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                点击右侧的锚点链接可以滚动到对应的内容区域。当前选中的锚点会高亮显示。
              </p>
            </div>
          </DemoBlock>

          <DemoBlock title="水平方向" description="锚点可以水平排列。" code={horizontalSnippet}>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Anchor direction="horizontal" onChange={handleChange}>
                <AnchorLink href="#horizontal-intro" title="介绍" />
                <AnchorLink href="#horizontal-usage" title="使用方法" />
                <AnchorLink href="#horizontal-api" title="API 文档" />
                <AnchorLink href="#horizontal-faq" title="常见问题" />
              </Anchor>
              <p className="mt-4 text-sm text-gray-500">水平锚点适合用于文章顶部的快速导航。</p>
            </div>
          </DemoBlock>

          <DemoBlock title="自定义容器" description="可以指定滚动容器。" code={targetSnippet}>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex gap-4">
                <div
                  ref={scrollContainer}
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
                  <Anchor target={() => scrollContainer.current}>
                    <AnchorLink href="#target-section1" title="Section 1" />
                    <AnchorLink href="#target-section2" title="Section 2" />
                    <AnchorLink href="#target-section3" title="Section 3" />
                    <AnchorLink href="#target-section4" title="Section 4" />
                  </Anchor>
                </div>
              </div>
            </div>
          </DemoBlock>

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

          {/* 用于演示锚点跳转的内容区域 */}
          <div id="anchor-demo-section1" className="scroll-mt-20">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">演示区域 1</h3>
              <p className="text-gray-600">
                这是用于演示锚点跳转效果的内容区域。点击右侧锚点链接可以滚动到这里。
              </p>
            </div>
          </div>

          <div id="anchor-demo-section2" className="scroll-mt-20">
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-700 mb-2">演示区域 2</h3>
              <p className="text-gray-600">
                锚点组件会自动检测滚动位置，高亮当前可见的区域对应的链接。
              </p>
            </div>
          </div>

          <div id="anchor-demo-section3" className="scroll-mt-20">
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">演示区域 3</h3>
              <p className="text-gray-600">
                通过 offsetTop 属性可以设置距离顶部的偏移量，用于处理固定头部的情况。
              </p>
            </div>
          </div>

          <div id="anchor-demo-section4" className="scroll-mt-20">
            <div className="p-6 bg-orange-50 rounded-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-700 mb-2">演示区域 4</h3>
              <p className="text-gray-600">
                锚点组件支持 onChange 事件，可以监听当前激活的锚点变化。
              </p>
            </div>
          </div>
        </div>

        {/* 右侧固定锚点导航 */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <h4 className="text-sm font-semibold text-gray-500 mb-4">页面导航</h4>
            <Anchor onChange={handleChange}>
              <AnchorLink href="#anchor-demo-section1" title="演示区域 1" />
              <AnchorLink href="#anchor-demo-section2" title="演示区域 2" />
              <AnchorLink href="#anchor-demo-section3" title="演示区域 3" />
              <AnchorLink href="#anchor-demo-section4" title="演示区域 4" />
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  )
}
