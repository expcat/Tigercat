import { useState } from 'react'
import { SplitButton } from '@expcat/tigercat-react/SplitButton'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <SplitButton
        danger
        triggerAriaLabel="更多删除选项"
        open={open}
        onOpenChange={setOpen}
        onClick={() => setOpen(false)}>
        删除
        <DropdownMenu>
          <DropdownItem onClick={() => setOpen(false)}>删除所选</DropdownItem>
          <DropdownItem divided onClick={() => setOpen(false)}>
            清空全部
          </DropdownItem>
        </DropdownMenu>
      </SplitButton>
      <p className="text-sm text-gray-500">菜单状态：{open ? '已打开' : '已关闭'}</p>
    </div>
  )
}
