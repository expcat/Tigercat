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
      <Space wrap>
        <Badge variant="default" content={1} />
        <Badge variant="primary" content={2} />
        <Badge variant="success" content={3} />
        <Badge variant="warning" content={4} />
        <Badge variant="danger" content={5} />
        <Badge variant="info" content={6} />
      </Space>
    </>
  )
}
