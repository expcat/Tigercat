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
      <div className="space-y-3">
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
        <p className="text-sm text-gray-600 dark:text-gray-300" role="status">
          最近操作：{lastCommand}
        </p>
      </div>
    </>
  )
}
