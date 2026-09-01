import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { Select } from '@expcat/tigercat-react/Select'

export default function App() {
  const [open, setOpen] = useState(false)
  const [assignee, setAssignee] = useState<string | number>('alice')

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="基本抽屉"
        footer={
          <Button size="sm" onClick={() => setOpen(false)}>
            关闭
          </Button>
        }>
        <div className="space-y-4">
          <p>受控打开。浮层自动使用 Drawer layer。</p>
          <label className="block space-y-1 text-sm">
            <span>负责人</span>
            <Select
              value={assignee}
              options={[
                { label: 'Alice', value: 'alice' },
                { label: 'Bob', value: 'bob' }
              ]}
              onChange={(value) => {
                if (value !== undefined && !Array.isArray(value)) setAssignee(value)
              }}
            />
          </label>
        </div>
      </Drawer>
    </>
  )
}
