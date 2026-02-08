import { useState, useEffect, useRef } from 'react'
import { BackTop, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<BackTop />
{/* 滚动页面超过 400px 后显示 */}`

const customHeightSnippet = `<BackTop visibilityHeight={200} />
{/* 滚动 200px 后即显示 */}`

const customContentSnippet = `<BackTop>
  <div className="custom-back-top">UP</div>
</BackTop>`

const customDurationSnippet = `<BackTop duration={800} />
{/* 滚动动画持续 800ms */}`

const customTargetSnippet = `const scrollRef = useRef<HTMLDivElement>(null)

<div ref={scrollRef} className="h-64 overflow-auto">
  <div className="h-[1000px] p-4">长内容...</div>
  {scrollRef.current && <BackTop target={() => scrollRef.current!} />}
</div>`

const clickSnippet = `<BackTop onClick={() => console.log('clicked')} />`

export default function BackTopDemo() {
  const [pageScrollContainer, setPageScrollContainer] = useState<HTMLElement | null>(null)
  const innerContainerRef = useRef<HTMLDivElement>(null)
  const [innerMounted, setInnerMounted] = useState(false)

  useEffect(() => {
    const container = document.querySelector('main > div.overflow-y-auto') as HTMLElement
    setPageScrollContainer(container)
    setInnerMounted(true)
  }, [])

  const handleClick = () => {
    console.log('BackTop clicked!')
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BackTop 回到顶部</h1>
        <p className="text-gray-600">返回页面顶部的操作按钮。</p>
      </div>

      <DemoBlock
        title="基本用法"
        description="滚动页面，右下角会出现回到顶部按钮。"
        code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            向下滚动页面超过 400px 后，右下角会出现回到顶部按钮。
          </p>
          <p className="text-sm text-gray-500">
            提示：本页面已添加 BackTop 组件，请向下滚动查看效果。
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义显示高度"
        description="可以设置滚动多少距离后显示按钮。"
        code={customHeightSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            通过 <code className="bg-gray-200 px-1 rounded">visibilityHeight</code>{' '}
            属性设置滚动高度阈值。
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义内容"
        description="可以自定义按钮的显示内容。"
        code={customContentSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">通过 children 自定义按钮内容。</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-lg">
              UP
            </div>
            <span className="text-sm text-gray-500">← 示例：自定义的回到顶部按钮样式</span>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义动画时长"
        description="通过 duration 属性控制滚动到顶部的动画时长。"
        code={customDurationSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            通过 <code className="bg-gray-200 px-1 rounded">duration</code>{' '}
            属性设置动画时长（毫秒），默认 450ms。
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义滚动容器"
        description="指定 target 监听自定义容器的滚动。"
        code={customTargetSnippet}>
        <div
          ref={innerContainerRef}
          className="h-64 overflow-auto rounded-lg border border-gray-200 relative">
          <div className="h-[1000px] p-4">
            <p className="text-gray-600 mb-4">在此容器内向下滚动查看回到顶部按钮。</p>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-gray-400 py-2">
                滚动内容行 {i + 1}
              </p>
            ))}
          </div>
          {innerMounted && innerContainerRef.current && (
            <BackTop target={() => innerContainerRef.current!} visibilityHeight={100} />
          )}
        </div>
      </DemoBlock>

      <DemoBlock title="点击回调" description="点击按钮时触发回调函数。" code={clickSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            通过 <code className="bg-gray-200 px-1 rounded">onClick</code> 监听点击事件。
          </p>
          <Button variant="outline" onClick={handleClick}>
            模拟点击（查看控制台）
          </Button>
        </div>
      </DemoBlock>

      {/* 添加一些内容使页面可以滚动 */}
      <div className="mt-8 space-y-8">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">占位内容 {i + 1}</h3>
            <p className="text-gray-600">
              这是用于演示滚动效果的占位内容。当页面滚动超过 400px 时，右下角会显示回到顶部按钮。
            </p>
          </div>
        ))}
      </div>

      {/* 页面级 BackTop - 监听布局的滚动容器 */}
      {pageScrollContainer && <BackTop target={() => pageScrollContainer} onClick={handleClick} />}
    </div>
  )
}
