import { useRef } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Message } from '@expcat/tigercat-react'

export default function App() {
  const closeMessage = useRef<(() => void) | null>(null)

  const showMessage = () => {
    closeMessage.current?.()
    closeMessage.current = Message.success('保存成功')
  }

  return (
    <Button variant="primary" onClick={showMessage}>
      显示消息
    </Button>
  )
}
