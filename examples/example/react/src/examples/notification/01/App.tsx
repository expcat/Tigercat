import { Button } from '@expcat/tigercat-react/Button'
import { notification } from '@expcat/tigercat-react'

export default function App() {
  const showNotifications = () => {
    notification.success({
      title: '保存成功',
      description: '个人资料已更新。'
    })
    notification.info({
      title: '同步完成',
      description: '草稿已上传到云端。'
    })
  }

  return (
    <Button variant="primary" onClick={showNotifications}>
      连续显示两条
    </Button>
  )
}
