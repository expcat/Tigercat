import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const closeNotification = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState('尚未显示通知')

  const showNotification = () => {
    closeNotification.current?.()
    setStatus('等待操作')
    closeNotification.current = notification.info({
      title: '发现新版本',
      description: '可先查看更新内容，再决定是否升级。',
      duration: 0,
      actions: [
        {
          label: '查看详情',
          type: 'primary',
          onClick: () => setStatus('已查看更新详情')
        }
      ],
      onClose: () => setStatus('通知已关闭')
    })
  }

  return (
    <div className="space-y-3">
      <Button variant="primary" onClick={showNotification}>
        显示操作通知
      </Button>
      <p className="text-sm text-gray-500" role="status">
        {status}
      </p>
    </div>
  )
}
