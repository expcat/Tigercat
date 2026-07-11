import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  const [lastCommand, setLastCommand] = useState('尚未选择操作')

  const handleCommand = (command: string) => {
    const labels: Record<string, string> = { edit: '编辑', copy: '复制', delete: '删除' }
    setLastCommand(labels[command] ?? command)
  }

  return (
    <>
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
    </>
  )
}
