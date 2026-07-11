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
        <Badge type="text" content="NEW" variant="danger" />
        <Badge type="text" content="HOT" variant="warning" />
        <Badge type="text" content="VIP" variant="primary" />
        <Badge type="text" content="推荐" variant="success" />
      </Space>
    </>
  )
}
