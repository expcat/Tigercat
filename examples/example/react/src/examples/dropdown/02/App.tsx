import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <Dropdown trigger="click" open={open} onOpenChange={setOpen}>
        <Button>{open ? '关闭菜单' : '打开菜单'}</Button>
        <DropdownMenu>
          <DropdownItem onClick={() => setOpen(false)}>保存并关闭</DropdownItem>
          <DropdownItem disabled>仅展示状态</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <p className="text-sm text-gray-500">受控状态：{open ? '已打开' : '已关闭'}</p>
    </div>
  )
}
