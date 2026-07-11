import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Drawer } from '@expcat/tigercat-react/Drawer'

export default function App() {
  const [open, setOpen] = useState(false)
  const [event, setEvent] = useState('尚未打开')

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>观察生命周期</Button>
      <p className="text-sm text-gray-500" role="status">
        {event}
      </p>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="生命周期抽屉"
        destroyOnClose
        deferDestroyOnClose
        onAfterEnter={() => setEvent('打开动画已完成')}
        onAfterClose={() => setEvent('关闭动画已完成')}>
        <p>关闭后内容会在动画结束时销毁。</p>
      </Drawer>
    </div>
  )
}
