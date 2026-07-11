import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Message } from '@expcat/tigercat-react'

export default function App() {
  const closeMessage = useRef<(() => void) | null>(null)
  const [active, setActive] = useState(false)

  const showMessage = () => {
    closeMessage.current?.()
    setActive(true)
    closeMessage.current = Message.loading({
      content: '正在处理请求...',
      onClose: () => setActive(false)
    })
  }

  const closeManually = () => {
    closeMessage.current?.()
    closeMessage.current = null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" disabled={active} onClick={showMessage}>
        显示加载消息
      </Button>
      <Button variant="secondary" disabled={!active} onClick={closeManually}>
        手动关闭
      </Button>
    </div>
  )
}
