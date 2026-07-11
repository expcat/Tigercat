import { useState } from 'react'
import { FloatButton } from '@expcat/tigercat-react/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-react/FloatButtonGroup'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative h-56 rounded border">
      <FloatButtonGroup
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        triggerNode={<FloatButton ariaLabel="打开操作组" tooltip="操作" />}
        style={{ position: 'absolute', right: 24, bottom: 24 }}>
        <FloatButton type="default" ariaLabel="编辑" tooltip="编辑" />
        <FloatButton type="default" ariaLabel="分享" tooltip="分享" />
      </FloatButtonGroup>
    </div>
  )
}
