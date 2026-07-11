import { useRef } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const closeNotification = useRef<(() => void) | null>(null)

  const showNotification = () => {
    closeNotification.current?.()
    closeNotification.current = notification.warning({
      title: '会话即将过期',
      description: '请在两分钟内保存当前内容。',
      position: 'bottom-left',
      duration: 2500
    })
  }

  return (
    <Button variant="primary" onClick={showNotification}>
      在左下角显示 2.5 秒
    </Button>
  )
}
