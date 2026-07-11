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
        <Badge content={5} standalone={false} position="top-right">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右上</div>
        </Badge>

        <Badge content={5} standalone={false} position="top-left">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左上</div>
        </Badge>

        <Badge content={5} standalone={false} position="bottom-right">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右下</div>
        </Badge>

        <Badge content={5} standalone={false} position="bottom-left">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左下</div>
        </Badge>
      </Space>
    </>
  )
}
