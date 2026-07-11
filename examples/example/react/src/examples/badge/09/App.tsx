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
        <div>
          <p className="text-sm text-gray-600 mb-2">默认（不显示零）</p>
          <Badge content={0} />
          <span className="text-gray-500 ml-2">（无徽章）</span>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">显示零值</p>
          <Badge content={0} showZero={true} />
        </div>
      </Space>
    </>
  )
}
