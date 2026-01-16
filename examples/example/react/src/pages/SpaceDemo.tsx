import React from 'react'
import { Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const horizontalSnippet = `<Space>
  <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 1</div>
  <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 2</div>
  <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 3</div>
</Space>`

const verticalSnippet = `<Space direction="vertical">
  <div className="bg-green-500 text-white px-4 py-2 rounded">Item 1</div>
  <div className="bg-green-500 text-white px-4 py-2 rounded">Item 2</div>
  <div className="bg-green-500 text-white px-4 py-2 rounded">Item 3</div>
</Space>`

const sizeSnippet = `<Space direction="vertical" className="w-full">
  <Space size="sm">...</Space>
  <Space size="md">...</Space>
  <Space size="lg">...</Space>
  <Space size={24}>...</Space>
</Space>`

const alignSnippet = `<Space direction="vertical" className="w-full">
  <Space align="center" className="w-full ...">...</Space>
  <Space align="baseline" className="w-full ...">...</Space>
</Space>`

const wrapSnippet = `<Space wrap size="sm" className="w-full">
  {Array.from({ length: 14 }).map(...)}
</Space>`

const SpaceDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Space 间距</h1>
        <p className="text-gray-600">设置组件之间的间距。</p>
      </div>

      <DemoBlock
        title="水平间距"
        description="默认水平方向（horizontal）。"
        code={horizontalSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 1</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 2</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 3</div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直间距"
        description='direction="vertical" 让子项纵向排列并产生间距。'
        code={verticalSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <div className="bg-green-500 text-white px-4 py-2 rounded">Item 1</div>
            <div className="bg-green-500 text-white px-4 py-2 rounded">Item 2</div>
            <div className="bg-green-500 text-white px-4 py-2 rounded">Item 3</div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同尺寸"
        description="size 支持内置尺寸（sm/md/lg）与自定义数值（px）。"
        code={sizeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <div>
              <p className="text-sm text-gray-600 mb-2">size="sm"</p>
              <Space size="sm">
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              </Space>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">size="md"（默认）</p>
              <Space size="md">
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              </Space>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">size="lg"</p>
              <Space size="lg">
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
                <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              </Space>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">size={24}（自定义 px）</p>
              <Space size={24}>
                <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
              </Space>
            </div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="对齐方式"
        description="align 控制交叉轴对齐（start/center/end/baseline/stretch）。"
        code={alignSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <div>
              <p className="text-sm text-gray-600 mb-2">align="center"</p>
              <Space
                align="center"
                className="w-full border border-dashed border-gray-300 p-3 rounded">
                <div className="bg-amber-500 text-white px-4 py-2 rounded h-10 flex items-center">
                  h-10
                </div>
                <div className="bg-amber-500 text-white px-4 py-2 rounded h-16 flex items-center">
                  h-16
                </div>
                <div className="bg-amber-500 text-white px-4 py-2 rounded h-12 flex items-center">
                  h-12
                </div>
              </Space>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">align="baseline"</p>
              <Space
                align="baseline"
                className="w-full border border-dashed border-gray-300 p-3 rounded">
                <div className="bg-rose-500 text-white px-4 py-2 rounded text-sm">Text-sm</div>
                <div className="bg-rose-500 text-white px-4 py-2 rounded text-lg">Text-lg</div>
                <div className="bg-rose-500 text-white px-4 py-2 rounded text-2xl">Text-2xl</div>
              </Space>
            </div>
          </Space>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自动换行"
        description="wrap=true 时，子项在空间不足时自动换行。"
        code={wrapSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="max-w-md">
            <Space wrap size="sm" className="w-full">
              {Array.from({ length: 14 }).map((_, index) => (
                <div key={index} className="bg-slate-700 text-white px-3 py-2 rounded">
                  Tag {index + 1}
                </div>
              ))}
            </Space>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}

export default SpaceDemo
