import React from 'react'
import { Button, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const typeSnippet = `<Space wrap>
  <Button variant="primary">主要按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="outline">轮廓按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="link">链接按钮</Button>
</Space>`

const sizeSnippet = `<Space align="center">
  <Button size="sm">小按钮</Button>
  <Button size="md">中按钮</Button>
  <Button size="lg">大按钮</Button>
</Space>`

const stateSnippet = `<Space direction="vertical" className="w-full">
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
    <Space>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
    </Space>
  </div>
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
    <Space>
      <Button variant="primary" disabled>主要按钮</Button>
      <Button variant="secondary" disabled>次要按钮</Button>
      <Button variant="outline" disabled>轮廓按钮</Button>
    </Space>
  </div>
  <div>
    <h3 className="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
    <Space>
      <Button variant="primary" loading>主要按钮</Button>
      <Button variant="secondary" loading>次要按钮</Button>
      <Button variant="outline" loading>轮廓按钮</Button>
    </Space>
  </div>
</Space>`

const blockSnippet = `<Space direction="vertical" className="w-full">
  <Button variant="primary" block>主要按钮</Button>
  <Button variant="secondary" block>次要按钮</Button>
  <Button variant="outline" block>轮廓按钮</Button>
</Space>`

const fullWidthSnippet = `<Space direction="vertical" className="w-full">
  <Button variant="primary" className="w-full">主要按钮</Button>
  <Button variant="secondary" className="w-full">次要按钮</Button>
  <Button variant="outline" className="w-full">轮廓按钮</Button>
</Space>`

const ButtonDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Button 按钮</h1>
        <p className="text-gray-600">按钮用于触发一个操作。</p>
      </div>

      {/* 按钮类型 */}
      <DemoBlock
        title="按钮类型"
        description="按钮有五种类型：主要按钮、次要按钮、轮廓按钮、幽灵按钮和链接按钮。"
        code={typeSnippet}>
        <Space wrap>
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
        </Space>
      </DemoBlock>

      {/* 按钮大小 */}
      <DemoBlock title="按钮大小" description="按钮有三种尺寸：小、中、大。" code={sizeSnippet}>
        <Space align="center">
          <Button size="sm">小按钮</Button>
          <Button size="md">中按钮</Button>
          <Button size="lg">大按钮</Button>
        </Space>
      </DemoBlock>

      {/* 按钮状态 */}
      <DemoBlock
        title="按钮状态"
        description="按钮可以处于正常、禁用或加载状态。"
        code={stateSnippet}>
        <Space direction="vertical" className="w-full">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
            <Space>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
            <Space>
              <Button variant="primary" disabled>
                主要按钮
              </Button>
              <Button variant="secondary" disabled>
                次要按钮
              </Button>
              <Button variant="outline" disabled>
                轮廓按钮
              </Button>
            </Space>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
            <Space>
              <Button variant="primary" loading>
                主要按钮
              </Button>
              <Button variant="secondary" loading>
                次要按钮
              </Button>
              <Button variant="outline" loading>
                轮廓按钮
              </Button>
            </Space>
          </div>
        </Space>
      </DemoBlock>

      {/* 块级按钮 */}
      <DemoBlock
        title="块级按钮"
        description="block 属性将使按钮适合其父宽度。"
        code={blockSnippet}>
        <Space direction="vertical" className="w-full">
          <Button variant="primary" block>
            主要按钮
          </Button>
          <Button variant="secondary" block>
            次要按钮
          </Button>
          <Button variant="outline" block>
            轮廓按钮
          </Button>
        </Space>
      </DemoBlock>

      {/* 全宽按钮 */}
      <DemoBlock
        title="全宽按钮"
        description="使用 className 设置按钮宽度。"
        code={fullWidthSnippet}>
        <Space direction="vertical" className="w-full">
          <Button variant="primary" className="w-full">
            主要按钮
          </Button>
          <Button variant="secondary" className="w-full">
            次要按钮
          </Button>
          <Button variant="outline" className="w-full">
            轮廓按钮
          </Button>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default ButtonDemo
