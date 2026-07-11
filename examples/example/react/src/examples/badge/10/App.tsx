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
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">通知中心</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space>
              <Badge content={notificationCount} standalone={false} variant="danger">
                <Button variant="primary" onClick={incrementNotifications}>
                  通知
                </Button>
              </Badge>

              <Button variant="secondary" onClick={clearNotifications}>
                清除通知
              </Button>
            </Space>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">消息和购物车</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space>
              <Badge content={messageCount} standalone={false} variant="primary" max={99}>
                <Button variant="primary">消息</Button>
              </Badge>

              <Badge content={cartItems} standalone={false} variant="danger">
                <Button variant="secondary">购物车</Button>
              </Badge>
            </Space>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">在线状态指示</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space wrap>
              <div className="flex items-center gap-3">
                <Badge type="dot" variant="success" standalone={false}>
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                    张三
                  </div>
                </Badge>
                <span className="text-green-600 font-medium">在线</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge type="dot" variant="default" standalone={false}>
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                    李四
                  </div>
                </Badge>
                <span className="text-gray-500">离线</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge type="dot" variant="warning" standalone={false}>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    王五
                  </div>
                </Badge>
                <span className="text-yellow-600">忙碌</span>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </>
  )
}
