import { useState } from 'react'
import { Loading, Button, Card } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Loading />
<Loading text="加载中..." />`

const variantSnippet = `<Loading variant="spinner" />
<Loading variant="ring" />
<Loading variant="dots" />
<Loading variant="bars" />
<Loading variant="pulse" />`

const sizeSnippet = `<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
<Loading size="xl" />`

const colorSnippet = `<Loading color="primary" />
<Loading color="secondary" />
<Loading color="success" />
<Loading color="warning" />
<Loading color="danger" />
<Loading color="info" />
<Loading color="default" />
<Loading customColor="#ff6b6b" />`

const fullscreenSnippet = `<Button onClick={showPageLoading}>显示全屏加载</Button>
{pageLoading && <Loading fullscreen text="页面加载中..." />}`

const cardSnippet = `<Card header="数据统计">...</Card>`

const buttonSnippet = `<Button loading={buttonLoading}>提交</Button>
<Button variant="secondary" loading={buttonLoading}>保存</Button>`

const delaySnippet = `<Loading delay={0} text="无延迟" />
<Loading delay={300} text="延迟 300ms" />`

export default function LoadingDemo() {
  const [pageLoading, setPageLoading] = useState(false)
  const [cardLoading, setCardLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)

  const showPageLoading = () => {
    setPageLoading(true)
    setTimeout(() => {
      setPageLoading(false)
    }, 2000)
  }

  const refreshCard = () => {
    setCardLoading(true)
    setTimeout(() => {
      setCardLoading(false)
    }, 1500)
  }

  const handleSubmit = () => {
    setButtonLoading(true)
    setTimeout(() => {
      setButtonLoading(false)
    }, 2000)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading 加载中</h1>
        <p className="text-gray-600">
          用于展示加载状态，支持多种加载动画样式，可用于页面和区块的加载状态。
        </p>
      </div>

      <DemoBlock title="基本用法" description="最简单的用法，显示加载动画。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-8 items-center justify-center">
            <Loading />
            <Loading text="加载中..." />
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="加载动画变体"
        description="Loading 组件支持 5 种不同的动画样式。"
        code={variantSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-5 gap-8">
            <div className="flex flex-col items-center gap-2">
              <Loading variant="spinner" />
              <span className="text-sm text-gray-600">Spinner</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading variant="ring" />
              <span className="text-sm text-gray-600">Ring</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading variant="dots" />
              <span className="text-sm text-gray-600">Dots</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading variant="bars" />
              <span className="text-sm text-gray-600">Bars</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading variant="pulse" />
              <span className="text-sm text-gray-600">Pulse</span>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸大小"
        description="Loading 组件支持 4 种不同的尺寸：sm、md（默认）、lg、xl。"
        code={sizeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-8 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loading size="sm" />
              <span className="text-sm text-gray-600">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading size="md" />
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading size="lg" />
              <span className="text-sm text-gray-600">Large</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading size="xl" />
              <span className="text-sm text-gray-600">Extra Large</span>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="颜色变体"
        description="Loading 组件支持 7 种颜色变体，也可以自定义颜色。"
        code={colorSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <Loading color="primary" />
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="secondary" />
              <span className="text-sm text-gray-600">Secondary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="success" />
              <span className="text-sm text-gray-600">Success</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="warning" />
              <span className="text-sm text-gray-600">Warning</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="danger" />
              <span className="text-sm text-gray-600">Danger</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="info" />
              <span className="text-sm text-gray-600">Info</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading color="default" />
              <span className="text-sm text-gray-600">Default</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading customColor="#ff6b6b" />
              <span className="text-sm text-gray-600">Custom</span>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="全屏加载"
        description="使用 fullscreen 属性可以创建全屏加载遮罩层。"
        code={fullscreenSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={showPageLoading}>显示全屏加载</Button>
          {pageLoading && <Loading fullscreen text="页面加载中..." />}
        </div>
      </DemoBlock>

      <DemoBlock title="区域加载" description="在某个区域内显示加载状态。" code={cardSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Card header="数据统计">
            <div className="relative min-h-[200px]">
              {cardLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loading text="刷新中..." />
                </div>
              ) : (
                <div>
                  <p className="mb-2">总用户数: 1,234</p>
                  <p className="mb-2">活跃用户: 567</p>
                  <p className="mb-4">新增用户: 89</p>
                  <Button onClick={refreshCard}>刷新数据</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </DemoBlock>

      <DemoBlock
        title="按钮加载"
        description="与按钮组合使用，展示操作进行中的状态。"
        code={buttonSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <Button loading={buttonLoading} onClick={handleSubmit}>
              提交
            </Button>
            <Button variant="secondary" loading={buttonLoading} onClick={handleSubmit}>
              保存
            </Button>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="延迟显示"
        description="使用 delay 属性可以延迟显示加载器，避免闪烁（延迟 300ms）。"
        code={delaySnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex gap-8 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loading delay={0} text="无延迟" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Loading delay={300} text="延迟 300ms" />
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
