import { Button } from '@expcat/tigercat-react/Button'
import { Card } from '@expcat/tigercat-react/Card'
import { useState } from 'react'
import { Loading } from '@expcat/tigercat-react/Loading'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './LoadingDemo.tsx?raw'

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

const basicScriptSnippet = `const [pageLoading, setPageLoading] = useState(false)
const [cardLoading, setCardLoading] = useState(false)
const [buttonLoading, setButtonLoading] = useState(false)`

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
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading 加载中</h1>
        <p className="text-gray-600 dark:text-gray-400">
          用于展示加载状态，支持多种加载动画样式，可用于页面和区块的加载状态。
        </p>
      </div>

      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、加载动画变体、尺寸大小等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex gap-8 items-center justify-center">
                <Loading />
                <Loading text="加载中..." />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">加载动画变体</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">尺寸大小</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">颜色变体</h3>
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
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="全屏加载"
        description="使用 fullscreen 属性可以创建全屏加载遮罩层。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Button onClick={showPageLoading}>显示全屏加载</Button>
          {pageLoading && <Loading fullscreen text="页面加载中..." />}
        </div>
      </DemoBlock>

      <DemoBlock
        title="区域加载等组合展示"
        description="合并展示区域加载、按钮加载、延迟显示，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">区域加载</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">按钮加载</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">延迟显示</h3>
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
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
