import { useState } from 'react'
import { Tooltip, Button, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Tooltip content="这是一个气泡提示">
  <Button>悬停显示提示</Button>
</Tooltip>`

const placementSnippet = `<div className="grid grid-cols-4 gap-4">
  <div className="flex justify-center">
    <Tooltip content="顶部提示" placement="top">
      <Button>Top</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="顶部开始" placement="top-start">
      <Button>Top Start</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="顶部结束" placement="top-end">
      <Button>Top End</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="底部提示" placement="bottom">
      <Button>Bottom</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="底部开始" placement="bottom-start">
      <Button>Bottom Start</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="底部结束" placement="bottom-end">
      <Button>Bottom End</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="左侧提示" placement="left">
      <Button>Left</Button>
    </Tooltip>
  </div>

  <div className="flex justify-center">
    <Tooltip content="右侧提示" placement="right">
      <Button>Right</Button>
    </Tooltip>
  </div>
</div>`

const triggerSnippet = `<Space size={16}>
  <Tooltip content="悬停触发（默认）" trigger="hover">
    <Button>Hover</Button>
  </Tooltip>

  <Tooltip content="点击触发" trigger="click">
    <Button>Click</Button>
  </Tooltip>

  <Tooltip content="聚焦触发" trigger="focus">
    <Button>Focus</Button>
  </Tooltip>
</Space>`

const contentSnippet = `<Tooltip
  content={
    <div>
      <strong>自定义内容</strong>
      <p>这里可以包含任何内容</p>
    </div>
  }>
  <Button>自定义提示</Button>
</Tooltip>`

const controlledSnippet = `<Space size={16}>
  <Tooltip visible={visible1} content="受控的气泡提示" onVisibleChange={setVisible1}>
    <Button>受控提示</Button>
  </Tooltip>

  <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '隐藏' : '显示'}</Button>
</Space>`

const disabledSnippet = `<Space size={16}>
  <Tooltip content="正常提示">
    <Button>正常</Button>
  </Tooltip>

  <Tooltip content="禁用提示" disabled>
    <Button>禁用</Button>
  </Tooltip>
</Space>`

export default function TooltipDemo() {
  const [visible1, setVisible1] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tooltip 气泡提示</h1>
        <p className="text-gray-600">用于显示简洁的文本提示信息。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="最简单的用法，悬停显示提示。" code={basicSnippet}>
        <Tooltip content="这是一个气泡提示">
          <Button>悬停显示提示</Button>
        </Tooltip>
      </DemoBlock>

      {/* 不同位置 */}
      <DemoBlock
        title="不同位置"
        description="通过 placement 属性设置气泡提示的显示位置。"
        code={placementSnippet}>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex justify-center">
            <Tooltip content="顶部提示" placement="top">
              <Button>Top</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="顶部开始" placement="top-start">
              <Button>Top Start</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="顶部结束" placement="top-end">
              <Button>Top End</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="底部提示" placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="底部开始" placement="bottom-start">
              <Button>Bottom Start</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="底部结束" placement="bottom-end">
              <Button>Bottom End</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="左侧提示" placement="left">
              <Button>Left</Button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip content="右侧提示" placement="right">
              <Button>Right</Button>
            </Tooltip>
          </div>
        </div>
      </DemoBlock>

      {/* 触发方式 */}
      <DemoBlock
        title="触发方式"
        description="支持 hover（默认）、click、focus 三种触发方式。"
        code={triggerSnippet}>
        <Space size={16}>
          <Tooltip content="悬停触发（默认）" trigger="hover">
            <Button>Hover</Button>
          </Tooltip>

          <Tooltip content="点击触发" trigger="click">
            <Button>Click</Button>
          </Tooltip>

          <Tooltip content="聚焦触发" trigger="focus">
            <Button>Focus</Button>
          </Tooltip>
        </Space>
      </DemoBlock>

      {/* 自定义内容 */}
      <DemoBlock
        title="自定义内容"
        description="可以通过 props 自定义提示内容。"
        code={contentSnippet}>
        <Tooltip
          content={
            <div>
              <strong>自定义内容</strong>
              <p>这里可以包含任何内容</p>
            </div>
          }>
          <Button>自定义提示</Button>
        </Tooltip>
      </DemoBlock>

      {/* 受控模式 */}
      <DemoBlock
        title="受控模式"
        description="可以通过 visible 属性控制气泡提示的显示和隐藏。"
        code={controlledSnippet}>
        <Space size={16}>
          <Tooltip visible={visible1} content="受控的气泡提示" onVisibleChange={setVisible1}>
            <Button>受控提示</Button>
          </Tooltip>

          <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '隐藏' : '显示'}</Button>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态"
        description="通过 disabled 属性禁用气泡提示。"
        code={disabledSnippet}>
        <Space size={16}>
          <Tooltip content="正常提示">
            <Button>正常</Button>
          </Tooltip>

          <Tooltip content="禁用提示" disabled>
            <Button>禁用</Button>
          </Tooltip>
        </Space>
      </DemoBlock>
    </div>
  )
}
