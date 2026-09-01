import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Input } from '@expcat/tigercat-react/Input'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [bareOpen, setBareOpen] = useState(false)
  const [closedCount, setClosedCount] = useState(0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>默认页脚</Button>
        <Button onClick={() => setSheetOpen(true)}>底栏表单</Button>
        <Button onClick={() => setBareOpen(true)}>无标题无遮罩</Button>
      </div>
      <p className="text-sm text-gray-500" role="status">
        已完成关闭：{closedCount} 次
      </p>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="临时表单"
        destroyOnClose
        showDefaultFooter
        draggable
        onAfterClose={() => setClosedCount((count) => count + 1)}>
        <label className="space-y-1 text-sm">
          <span>备注</span>
          <Input placeholder="关闭后销毁此内容" />
        </label>
      </Modal>
      <Modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="可滚动底栏"
        mobileSheet
        showDefaultFooter>
        <div className="space-y-3">
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>滚动条目 {index + 1}。下滑关闭只在顶部或标题栏生效。</p>
          ))}
        </div>
      </Modal>
      <Modal open={bareOpen} onOpenChange={setBareOpen} mask={false}>
        <p>没有可见标题时 dialog 仍有 locale 名。mask=false 时空区点得透。</p>
      </Modal>
    </div>
  )
}
