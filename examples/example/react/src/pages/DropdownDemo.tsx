import { useState } from 'react'
import { Dropdown, DropdownMenu, DropdownItem, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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
    <Button>点击触发</Button>
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

const defaultVisibleSnippet = `<Dropdown defaultVisible trigger="click">
  <Button>默认展开</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
  </DropdownMenu>
</Dropdown>`

export default function DropdownDemo() {
  const [visible1, setVisible1] = useState(false)

  const handleCommand = (command: string) => {
    console.log('点击了：', command)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dropdown 下拉菜单</h1>
        <p className="text-gray-600">向下弹出的列表菜单。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock
        title="基本用法"
        description="悬停在触发元素上时显示下拉菜单。"
        code={basicSnippet}>
        <Dropdown>
          <Button>悬浮触发</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>

      {/* 触发方式 */}
      <DemoBlock title="触发方式" description="支持点击和悬浮两种触发方式。" code={triggerSnippet}>
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
            <Button>点击触发</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </DemoBlock>

      {/* 弹出位置 */}
      <DemoBlock title="弹出位置" description="支持 12 种弹出位置。" code={placementSnippet}>
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
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态"
        description="禁用整个下拉菜单或单个菜单项。"
        code={disabledSnippet}>
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
      </DemoBlock>

      {/* 分割线 */}
      <DemoBlock
        title="分割线"
        description="使用 divided 属性在菜单项之间添加分割线。"
        code={dividedSnippet}>
        <Dropdown>
          <Button>操作菜单</Button>
          <DropdownMenu>
            <DropdownItem>编辑</DropdownItem>
            <DropdownItem>复制</DropdownItem>
            <DropdownItem divided>删除</DropdownItem>
            <DropdownItem>下载</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>

      {/* 点击事件 */}
      <DemoBlock
        title="点击事件"
        description="监听菜单项的点击事件（查看控制台）。"
        code={clickSnippet}>
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
        description="通过 visible 和 onVisibleChange 控制下拉菜单的显示隐藏。"
        code={controlledSnippet}>
        <div className="flex gap-4 items-center">
          <Dropdown visible={visible1} onVisibleChange={setVisible1}>
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
        title="多种按钮样式"
        description="下拉菜单可以搭配不同样式的按钮使用。"
        code={variantSnippet}>
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
      </DemoBlock>

      {/* 无箭头 */}
      <DemoBlock
        title="无箭头指示器"
        description="通过 showArrow={false} 隐藏下拉箭头。"
        code={noArrowSnippet}>
        <Dropdown showArrow={false}>
          <Button>无箭头指示器</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>

      {/* 点击不关闭 */}
      <DemoBlock
        title="点击不关闭"
        description="设置 closeOnClick={false}，点击菜单项不会自动关闭。"
        code={closeOnClickSnippet}>
        <Dropdown closeOnClick={false} trigger="click">
          <Button>点击不关闭</Button>
          <DropdownMenu>
            <DropdownItem>多选项 1</DropdownItem>
            <DropdownItem>多选项 2</DropdownItem>
            <DropdownItem>多选项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>

      {/* 默认展开 */}
      <DemoBlock
        title="默认展开"
        description="通过 defaultVisible 设置初始展开状态。"
        code={defaultVisibleSnippet}>
        <Dropdown defaultVisible trigger="click">
          <Button>默认展开</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </DemoBlock>
    </div>
  )
}
