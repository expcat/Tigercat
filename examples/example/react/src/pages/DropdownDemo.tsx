import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './DropdownDemo.tsx?raw'

const basicSnippet = `<Dropdown>
  <Button>悬浮触发</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
    <DropdownItem>菜单项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const triggerSnippet = `<div className="flex gap-4">
  <Dropdown trigger="hover">
    <Button>悬浮触发</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown trigger="click">
    <Button className="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-800 transition-colors">
      点击触发
    </Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const placementSnippet = `<div className="flex flex-col gap-4">
  <div className="flex gap-4">
    <Dropdown placement="bottom-start">
      <Button>底部-左对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="bottom">
      <Button>底部-居中</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="bottom-end">
      <Button>底部-右对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>

  <div className="flex gap-4">
    <Dropdown placement="top-start">
      <Button>顶部-左对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="top">
      <Button>顶部-居中</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="top-end">
      <Button>顶部-右对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</div>`

const disabledSnippet = `<div className="flex gap-4">
  <Dropdown disabled>
    <Button disabled>禁用的下拉菜单</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button>部分禁用</Button>
    <DropdownMenu>
      <DropdownItem>编辑</DropdownItem>
      <DropdownItem disabled>删除（已禁用）</DropdownItem>
      <DropdownItem>复制</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const dividedSnippet = `<Dropdown>
  <Button>操作菜单</Button>
  <DropdownMenu>
    <DropdownItem>编辑</DropdownItem>
    <DropdownItem>复制</DropdownItem>
    <DropdownItem divided>删除</DropdownItem>
    <DropdownItem>下载</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const clickSnippet = `<Dropdown>
  <Button>操作</Button>
  <DropdownMenu>
    <DropdownItem onClick={() => handleCommand('edit')}>编辑</DropdownItem>
    <DropdownItem onClick={() => handleCommand('copy')}>复制</DropdownItem>
    <DropdownItem onClick={() => handleCommand('delete')} divided>删除</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const controlledSnippet = `<div className="flex gap-4 items-center">
  <Dropdown visible={visible1} onVisibleChange={setVisible1}>
    <Button>受控下拉菜单</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
  <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '关闭' : '打开'}下拉菜单</Button>
</div>`

const variantSnippet = `<div className="flex gap-4">
  <Dropdown>
    <Button variant="primary">主要按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button variant="secondary">次要按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button variant="outline">轮廓按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const noArrowSnippet = `<Dropdown showArrow={false}>
  <Button>无箭头指示器</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
    <DropdownItem>菜单项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const closeOnClickSnippet = `<Dropdown closeOnClick={false} trigger="click">
  <Button>点击不关闭</Button>
  <DropdownMenu>
    <DropdownItem>多选项 1</DropdownItem>
    <DropdownItem>多选项 2</DropdownItem>
    <DropdownItem>多选项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const defaultVisibleSnippet = `<Dropdown defaultOpen trigger="click">
  <Button>默认展开</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const controlledScriptSnippet = `const [visible1, setVisible1] = useState(false)`

export default function DropdownDemo() {
  const [visible1, setVisible1] = useState(false)

  const handleCommand = (command: string) => {
    console.log('点击了：', command)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dropdown 下拉菜单</h1>
        <p className="text-gray-600 dark:text-gray-400">向下弹出的列表菜单。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、触发方式、弹出位置等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <Dropdown>
              <Button>悬浮触发</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
            <div className="flex gap-4">
              <Dropdown trigger="hover">
                <Button>悬浮触发</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                  <DropdownItem>菜单项 3</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown trigger="click">
                <Button className="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-800 transition-colors">
                  点击触发
                </Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                  <DropdownItem>菜单项 3</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">弹出位置</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Dropdown placement="bottom-start">
                  <Button>底部-左对齐</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <Dropdown placement="bottom">
                  <Button>底部-居中</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <Dropdown placement="bottom-end">
                  <Button>底部-右对齐</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="flex gap-4">
                <Dropdown placement="top-start">
                  <Button>顶部-左对齐</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <Dropdown placement="top">
                  <Button>顶部-居中</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <Dropdown placement="top-end">
                  <Button>顶部-右对齐</Button>
                  <DropdownMenu>
                    <DropdownItem>菜单项 1</DropdownItem>
                    <DropdownItem>菜单项 2</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
            <div className="flex gap-4">
              <Dropdown disabled>
                <Button disabled>禁用的下拉菜单</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <Button>部分禁用</Button>
                <DropdownMenu>
                  <DropdownItem>编辑</DropdownItem>
                  <DropdownItem disabled>删除（已禁用）</DropdownItem>
                  <DropdownItem>复制</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">分割线</h3>
            <Dropdown>
              <Button>操作菜单</Button>
              <DropdownMenu>
                <DropdownItem>编辑</DropdownItem>
                <DropdownItem>复制</DropdownItem>
                <DropdownItem divided>删除</DropdownItem>
                <DropdownItem>下载</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </DemoBlock>

      {/* 点击事件 */}
      <DemoBlock
        title="点击事件"
        description="监听菜单项的点击事件（查看控制台）。"
        code={fullPageSnippet}>
        <Dropdown>
          <Button>操作</Button>
          <DropdownMenu>
            <DropdownItem onClick={() => handleCommand('edit')}>编辑</DropdownItem>
            <DropdownItem onClick={() => handleCommand('copy')}>复制</DropdownItem>
            <DropdownItem onClick={() => handleCommand('delete')} divided>
              删除
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>

      {/* 受控模式 */}
      <DemoBlock
        title="受控模式"
        description="通过 open 和 onOpenChange 控制下拉菜单的显示隐藏。"
        code={fullPageSnippet}>
        <div className="flex gap-4 items-center">
          <Dropdown open={visible1} onOpenChange={setVisible1}>
            <Button>受控下拉菜单</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button onClick={() => setVisible1(!visible1)}>
            {visible1 ? '关闭' : '打开'}下拉菜单
          </Button>
        </div>
      </DemoBlock>

      {/* 多种按钮 */}
      <DemoBlock
        title="多种按钮样式等组合展示"
        description="合并展示多种按钮样式、无箭头指示器、点击不关闭等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多种按钮样式</h3>
            <div className="flex gap-4">
              <Dropdown>
                <Button variant="primary">主要按钮</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                  <DropdownItem>菜单项 3</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <Button variant="secondary">次要按钮</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                  <DropdownItem>菜单项 3</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <Button variant="outline">轮廓按钮</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                  <DropdownItem>菜单项 3</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">无箭头指示器</h3>
            <Dropdown showArrow={false}>
              <Button>无箭头指示器</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">点击不关闭</h3>
            <Dropdown closeOnClick={false} trigger="click">
              <Button>点击不关闭</Button>
              <DropdownMenu>
                <DropdownItem>多选项 1</DropdownItem>
                <DropdownItem>多选项 2</DropdownItem>
                <DropdownItem>多选项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">默认展开</h3>
            <Dropdown defaultOpen trigger="click">
              <Button>默认展开</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}
