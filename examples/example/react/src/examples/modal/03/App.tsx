import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Input } from '@expcat/tigercat-react/Input'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [open, setOpen] = useState(false)
  const [closedCount, setClosedCount] = useState(0)

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>打开临时表单</Button>
      <p className="text-sm text-gray-500" role="status">
        已完成关闭：{closedCount} 次
      </p>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="临时表单"
        destroyOnClose
        showDefaultFooter
        onAfterClose={() => setClosedCount((count) => count + 1)}>
        <label className="space-y-1 text-sm">
          <span>备注</span>
          <Input placeholder="关闭后销毁此内容" />
        </label>
      </Modal>
    </div>
  )
}
