import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Message } from '@expcat/tigercat-react'

const starIcon =
  'M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.85l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z'

export default function App() {
  const closeMessage = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState('尚未显示消息')

  const showMessage = () => {
    closeMessage.current?.()
    setStatus('等待消息关闭')
    closeMessage.current = Message.info({
      content: '已收藏当前页面',
      icon: starIcon,
      className: 'shadow-xl',
      closable: true,
      onClose: () => setStatus('消息已关闭')
    })
  }

  return (
    <div className="space-y-3">
      <Button variant="primary" onClick={showMessage}>
        显示自定义消息
      </Button>
      <p className="text-sm text-gray-500" role="status">
        {status}
      </p>
    </div>
  )
}
