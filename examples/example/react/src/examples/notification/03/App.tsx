import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const closeNotification = useRef<(() => void) | null>(null)
  const [active, setActive] = useState(false)

  const showNotification = () => {
    closeNotification.current?.()
    setActive(true)
    closeNotification.current = notification.info({
      title: '后台任务运行中',
      description: '任务结束后可手动关闭这条通知。',
      duration: 0,
      onClose: () => setActive(false)
    })
  }

  const closeManually = () => {
    closeNotification.current?.()
    closeNotification.current = null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" disabled={active} onClick={showNotification}>
        显示常驻通知
      </Button>
      <Button variant="secondary" disabled={!active} onClick={closeManually}>
        手动关闭
      </Button>
    </div>
  )
}
