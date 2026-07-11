import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Popconfirm } from '@expcat/tigercat-react/Popconfirm'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <Popconfirm
      open={open}
      onOpenChange={setOpen}
      title="提交当前表单？"
      placement="right"
      okText="提交"
      onConfirm={() => setOpen(false)}>
      <Button>{open ? '确认框已打开' : '受控确认框'}</Button>
    </Popconfirm>
  )
}
