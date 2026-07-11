import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <Tooltip
      open={open}
      onOpenChange={setOpen}
      trigger="manual"
      content="这是受控提示"
      placement="right">
      <Button onClick={() => setOpen((value) => !value)}>{open ? '隐藏提示' : '显示提示'}</Button>
    </Tooltip>
  )
}
