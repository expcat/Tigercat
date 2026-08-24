import { useState } from 'react'
import { SplitButton } from '@expcat/tigercat-react/SplitButton'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未操作')

  return (
    <div className="space-y-3">
      <SplitButton onClick={() => setLastAction('保存')}>
        保存
        <DropdownMenu>
          <DropdownItem onClick={() => setLastAction('存为草稿')}>存为草稿</DropdownItem>
          <DropdownItem onClick={() => setLastAction('保存并发布')}>保存并发布</DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
