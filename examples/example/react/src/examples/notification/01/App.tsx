import { useRef } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const closeNotification = useRef<(() => void) | null>(null)

  const showNotification = () => {
    closeNotification.current?.()
    closeNotification.current = notification.success({
      title: '保存成功',
      description: '个人资料已更新。'
    })
  }

  return (
    <Button variant="primary" onClick={showNotification}>
      显示通知
    </Button>
  )
}
