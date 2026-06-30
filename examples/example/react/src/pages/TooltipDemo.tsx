import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './TooltipDemo.tsx?raw'

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
  <Tooltip open={visible1} content="受控的气泡提示" onOpenChange={setVisible1}>
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

const offsetSnippet = `<Space size={16}>
  <Tooltip content="默认偏移 (8px)">
    <Button>默认</Button>
  </Tooltip>

  <Tooltip content="偏移 16px" offset={16}>
    <Button>offset=16</Button>
  </Tooltip>

  <Tooltip content="偏移 24px" offset={24}>
    <Button>offset=24</Button>
  </Tooltip>
</Space>`

const flipSnippet = `<div className="p-4 bg-gray-100 rounded overflow-auto h-32">
  <div className="pt-16">
    <Tooltip content="空间不足时自动翻转" placement="top">
      <Button>试试滚动容器</Button>
    </Tooltip>
  </div>
</div>`

const basicScriptSnippet = `const [visible1, setVisible1] = useState(false)`

export default function TooltipDemo() {
  const [visible1, setVisible1] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tooltip 气泡提示</h1>
        <p className="text-gray-600 dark:text-gray-400">用于显示简洁的文本提示信息。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、不同位置、触发方式等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <Tooltip content="这是一个气泡提示">
              <Button>悬停显示提示</Button>
            </Tooltip>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
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
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义内容</h3>
            <Tooltip
              content={
                <div>
                  <strong>自定义内容</strong>
                  <p>这里可以包含任何内容</p>
                </div>
              }>
              <Button>自定义提示</Button>
            </Tooltip>
          </div>
        </div>
      </DemoBlock>

      {/* 受控模式 */}
      <DemoBlock
        title="受控模式"
        description="可以通过 open 属性控制气泡提示的显示和隐藏。"
        code={fullPageSnippet}>
        <Space size={16}>
          <Tooltip open={visible1} content="受控的气泡提示" onOpenChange={setVisible1}>
            <Button>受控提示</Button>
          </Tooltip>

          <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '隐藏' : '显示'}</Button>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态等组合展示"
        description="合并展示禁用状态、偏移距离、自动翻转 (Floating UI)，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
            <Space size={16}>
              <Tooltip content="正常提示">
                <Button>正常</Button>
              </Tooltip>

              <Tooltip content="禁用提示" disabled>
                <Button>禁用</Button>
              </Tooltip>
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">偏移距离</h3>
            <Space size={16}>
              <Tooltip content="默认偏移 (8px)">
                <Button>默认</Button>
              </Tooltip>

              <Tooltip content="偏移 16px" offset={16}>
                <Button>offset=16</Button>
              </Tooltip>

              <Tooltip content="偏移 24px" offset={24}>
                <Button>offset=24</Button>
              </Tooltip>
            </Space>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              自动翻转 (Floating UI)
            </h3>
            <div className="p-4 bg-gray-100 rounded overflow-auto h-32">
              <div className="pt-16">
                <Tooltip content="空间不足时自动翻转" placement="top">
                  <Button>试试滚动容器</Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
