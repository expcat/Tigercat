import { useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Message } from '@expcat/tigercat-react'

export default function App() {
  const closeMessage = useRef<(() => void) | null>(null)
  const [running, setRunning] = useState(false)

  const submit = async () => {
    closeMessage.current?.()
    setRunning(true)

    const closeLoading = Message.loading('正在提交...')
    closeMessage.current = closeLoading
    await new Promise((resolve) => window.setTimeout(resolve, 1200))

    closeLoading()
    closeMessage.current = Message.success('提交成功')
    setRunning(false)
  }

  return (
    <Button variant="primary" loading={running} disabled={running} onClick={submit}>
      提交表单
    </Button>
  )
}
