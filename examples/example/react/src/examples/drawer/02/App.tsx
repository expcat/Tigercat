import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>从底部打开</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        mask={false}
        title="筛选条件"
        footer={
          <Button size="sm" onClick={() => setOpen(false)}>
            应用
          </Button>
        }>
        <div className="space-y-3">
          <p>mask=false 时空区点得透。内容可滚，下滑不会误关。</p>
          <label className="space-y-1 text-sm">
            <span>关键词</span>
            <Input placeholder="输入关键词" />
          </label>
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index}>滚动条目 {index + 1}</p>
          ))}
        </div>
      </Drawer>
    </>
  )
}
