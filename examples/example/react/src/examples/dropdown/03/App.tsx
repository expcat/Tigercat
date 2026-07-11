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
      <div className="flex gap-4 items-center">
        <Dropdown open={visible1} onOpenChange={setVisible1}>
          <Button>受控下拉菜单</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '关闭' : '打开'}下拉菜单</Button>
      </div>
    </>
  )
}
