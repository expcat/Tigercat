import { Button } from '@expcat/tigercat-react/Button'
import { useRef, useState } from 'react'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const closeNotificationRef = useRef<(() => void) | null>(null)

  const [lastAction, setLastAction] = useState('尚未触发通知回调')

  // 基本类型
  const showInfo = () => {
    notification.info({
      title: '信息通知',
      description: '这是一条信息通知的详细描述内容'
    })
  }

  const showSuccess = () => {
    notification.success({
      title: '操作成功',
      description: '您的操作已经成功完成！'
    })
  }

  const showWarning = () => {
    notification.warning({
      title: '警告提示',
      description: '请注意相关事项，以避免潜在问题'
    })
  }

  const showError = () => {
    notification.error({
      title: '操作失败',
      description: '操作失败，请检查网络连接后重试'
    })
  }

  // 不同位置
  const showTopLeft = () => {
    notification.info({
      title: '左上角通知',
      description: '这是显示在左上角的通知',
      position: 'top-left'
    })
  }

  const showTopRight = () => {
    notification.success({
      title: '右上角通知',
      description: '这是显示在右上角的通知（默认位置）',
      position: 'top-right'
    })
  }

  const showBottomLeft = () => {
    notification.warning({
      title: '左下角通知',
      description: '这是显示在左下角的通知',
      position: 'bottom-left'
    })
  }

  const showBottomRight = () => {
    notification.error({
      title: '右下角通知',
      description: '这是显示在右下角的通知',
      position: 'bottom-right'
    })
  }

  // 自定义持续时间
  const showShortNotification = () => {
    notification.info({
      title: '短时间通知',
      description: '这条通知2秒后关闭',
      duration: 2000
    })
  }

  const showLongNotification = () => {
    notification.success({
      title: '长时间通知',
      description: '这条通知10秒后关闭',
      duration: 10000
    })
  }

  const showPersistentNotification = () => {
    notification.warning({
      title: '持久通知',
      description: '这条通知需要手动关闭',
      duration: 0
    })
  }

  // 可关闭性
  const showClosableNotification = () => {
    notification.info({
      title: '可关闭通知',
      description: '这条通知可以通过点击关闭按钮来关闭',
      closable: true,
      duration: 0
    })
  }

  const showNonClosableNotification = () => {
    notification.success({
      title: '不可手动关闭',
      description: '这条通知没有关闭按钮，5秒后自动消失',
      closable: false,
      duration: 5000
    })
  }

  // 手动控制
  const showNotification = () => {
    closeNotificationRef.current = notification.info({
      title: '处理中',
      description: '正在处理您的请求...',
      duration: 0
    })
  }

  const closeManually = () => {
    if (closeNotificationRef.current) {
      closeNotificationRef.current()
      closeNotificationRef.current = null
    }
  }

  const simulateRequest = async () => {
    const close = notification.info({
      title: '请求处理',
      description: '正在处理您的请求...',
      duration: 0
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    close()
    notification.success({
      title: '请求成功',
      description: '您的请求已成功处理！'
    })
  }

  // 点击事件
  const showClickableNotification = () => {
    notification.info({
      title: '可点击通知',
      description: '点击这条通知查看详情',
      onClick: () => {
        setLastAction('已点击通知并查看详情')
      }
    })
  }

  // 回调函数
  const showNotificationWithCallback = () => {
    notification.success({
      title: '操作成功',
      description: '您的操作已经成功完成！',
      onClose: () => {
        setLastAction('带回调通知已关闭')
      }
    })
  }

  const showActionNotification = () => {
    notification.info({
      title: '新通知',
      description: '支持在 toast 内渲染多个操作按钮。',
      duration: 0,
      actions: [
        {
          label: '查看',
          type: 'primary',
          onClick: () => {
            setLastAction('已打开通知详情')
          }
        },
        {
          label: '撤销',
          closeOnClick: true,
          onClick: () => {
            setLastAction('已撤销通知相关操作')
          }
        }
      ]
    })
  }

  // 清空通知
  const showMultipleNotifications = () => {
    notification.info({
      title: '通知 1',
      description: '第一条通知',
      position: 'top-right'
    })

    notification.success({
      title: '通知 2',
      description: '第二条通知',
      position: 'top-left'
    })

    notification.warning({
      title: '通知 3',
      description: '第三条通知',
      position: 'bottom-right'
    })
  }

  const clearAll = () => {
    notification.clear()
  }

  const clearTopRight = () => {
    notification.clear('top-right')
  }

  // 快速使用
  const quickInfo = () => {
    notification.info('快速信息通知')
  }

  const quickSuccess = () => {
    notification.success('快速成功通知')
  }

  const quickWarning = () => {
    notification.warning('快速警告通知')
  }

  const quickError = () => {
    notification.error('快速错误通知')
  }

  // 自定义外观
  const showCustomIcon = () => {
    notification.info({
      title: '自定义图标',
      description: '使用自定义 SVG 路径作为图标',
      icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
      duration: 0
    })
  }

  const showCustomClass = () => {
    notification.success({
      title: '自定义样式',
      description: '通过 className 自定义通知样式',
      className: 'shadow-2xl ring-2 ring-blue-300',
      duration: 0
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={showNotification}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          显示通知
        </Button>
        <Button
          onClick={closeManually}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          手动关闭
        </Button>
        <Button
          onClick={simulateRequest}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          模拟请求
        </Button>
      </div>
    </>
  )
}
