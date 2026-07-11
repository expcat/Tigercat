import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  const [notificationCount, setNotificationCount] = useState(5)

  const [messageCount] = useState(99)

  const [cartItems] = useState(3)

  const incrementNotifications = () => {
    setNotificationCount((prev) => prev + 1)
  }

  const clearNotifications = () => {
    setNotificationCount(0)
  }

  return (
    <>
      <Space>
        <Badge content={5} standalone={false}>
          <Button>通知</Button>
        </Badge>

        <Badge content={99} standalone={false} variant="danger">
          <Button variant="secondary">消息</Button>
        </Badge>

        <Badge type="dot" standalone={false} variant="danger">
          <Button variant="outline">邮件</Button>
        </Badge>
      </Space>
    </>
  )
}
