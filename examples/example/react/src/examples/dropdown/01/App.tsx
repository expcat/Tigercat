import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未选择')

  return (
    <div className="space-y-3">
      <Dropdown trigger="click">
        <Button>操作</Button>
        <DropdownMenu>
          <DropdownItem onClick={() => setLastAction('编辑')}>编辑</DropdownItem>
          <DropdownItem onClick={() => setLastAction('复制')}>复制</DropdownItem>
          <DropdownItem divided onClick={() => setLastAction('删除')}>
            删除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
