import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './ButtonDemo.tsx?raw'

const ButtonDemo: React.FC = () => {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Button 按钮</h1>
        <p className="text-gray-600 dark:text-gray-400">按钮用于触发一个操作。</p>
      </div>

      <DemoBlock
        title="外观、尺寸与状态"
        description="合并展示按钮类型、尺寸、禁用/加载状态和自定义加载图标。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full" size="lg">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">类型</h3>
            <Space wrap>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="link">链接按钮</Button>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">尺寸</h3>
            <Space align="center">
              <Button size="sm">小按钮</Button>
              <Button size="md">中按钮</Button>
              <Button size="lg">大按钮</Button>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">状态</h3>
            <Space wrap>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary" disabled>
                禁用按钮
              </Button>
              <Button variant="outline" loading>
                加载中
              </Button>
              <Button
                variant="primary"
                loading
                loadingIcon={
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }>
                自定义加载图标
              </Button>
            </Space>
          </div>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="行为与原生类型"
        description="合并展示点击事件和 HTML 原生 button 类型。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full" size="lg">
          <Space align="center">
            <Button variant="primary" onClick={() => setClickCount((c) => c + 1)}>
              已点击 {clickCount} 次
            </Button>
            <Button variant="secondary" onClick={() => setClickCount(0)}>
              重置
            </Button>
          </Space>
          <form onSubmit={(e) => e.preventDefault()}>
            <Space>
              <Button htmlType="submit" variant="primary">
                提交
              </Button>
              <Button htmlType="reset" variant="outline">
                重置
              </Button>
              <Button htmlType="button" variant="ghost">
                普通按钮
              </Button>
            </Space>
          </form>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="宽度"
        description="合并展示 block 填满容器和 className 自定义宽度两种方式。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full" size="lg">
          <Space direction="vertical" className="w-full">
            <Button variant="primary" block>
              block 主要按钮
            </Button>
            <Button variant="secondary" block>
              block 次要按钮
            </Button>
          </Space>
          <Space direction="vertical" className="w-full">
            <Button variant="primary" className="w-1/2">
              50% 宽度
            </Button>
            <Button variant="secondary" className="w-3/4">
              75% 宽度
            </Button>
            <Button variant="outline" className="w-full">
              100% 宽度
            </Button>
          </Space>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default ButtonDemo
