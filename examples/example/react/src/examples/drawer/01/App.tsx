import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Drawer } from '@expcat/tigercat-react/Drawer'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="基本抽屉"
        placement="right"
        size="md"
        footer={
          <Button size="sm" onClick={() => setOpen(false)}>
            关闭
          </Button>
        }>
        <p>一个受控实例复合展示位置、尺寸、遮罩和默认关闭行为。</p>
      </Drawer>
    </>
  )
}
