import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑筛选条件</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        size="sm"
        header={
          <div>
            <strong>筛选设置</strong>
            <p className="text-xs text-gray-500">自定义头部说明</p>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setOpen(false)}>应用</Button>
          </div>
        }>
        <label className="space-y-1 text-sm">
          <span>关键词</span>
          <Input placeholder="输入关键词" />
        </label>
      </Drawer>
    </>
  )
}
