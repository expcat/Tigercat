import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Popover } from '@expcat/tigercat-react/Popover'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="manual"
      title="受控内容"
      content="显示状态完全由外部状态管理。">
      <Button onClick={() => setOpen((value) => !value)}>{open ? '隐藏卡片' : '显示卡片'}</Button>
    </Popover>
  )
}
