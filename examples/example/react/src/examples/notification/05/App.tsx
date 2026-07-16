import { useState } from 'react'
import type { NotificationInstance } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { NotificationContainer } from '@expcat/tigercat-react/NotificationContainer'

export default function NotificationContainerExample() {
  const [status, setStatus] = useState('等待操作')

  const createNotifications = (): NotificationInstance[] => [
    {
      id: 'review',
      type: 'warning',
      title: '发布前检查',
      description: '还有两项检查尚未完成。',
      duration: 0,
      closable: true,
      position: 'bottom-right',
      closeAriaLabel: '关闭发布检查通知',
      onClick: () => setStatus('已打开检查列表'),
      actions: [
        {
          key: 'details',
          label: '查看详情',
          type: 'primary',
          onClick: () => setStatus('已查看检查详情')
        }
      ]
    },
    {
      id: 'backup',
      type: 'success',
      title: '备份完成',
      description: '项目快照已安全保存。',
      duration: 0,
      closable: false,
      position: 'bottom-right'
    }
  ]

  const [notifications, setNotifications] = useState<NotificationInstance[]>(createNotifications)

  const removeNotification = (id: string | number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
    setStatus(`已关闭通知：${id}`)
  }

  return (
    <div style={{ minHeight: 260 }}>
      <div className="flex items-center justify-between gap-3">
        <span role="status" className="text-sm text-gray-500">
          {status}，剩余 {notifications.length} 条
        </span>
        <Button size="sm" onClick={() => setNotifications(createNotifications())}>
          重置通知
        </Button>
      </div>
      <NotificationContainer
        position="bottom-right"
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  )
}
