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
    </>
  )
}
