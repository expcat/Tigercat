import { useState } from 'react'
import { Alert } from '@expcat/tigercat-react/Alert'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [show, setShow] = useState(true)

  return (
    <div className="space-y-3">
      <Alert type="warning" banner title="banner 横幅：撑满宽度、无圆角，常用于页面顶部通知。" showIcon />
      {show ? (
        <Alert
          type="info"
          title="5 秒后自动关闭"
          description="duration + showCountdown 显示倒计时进度条。"
          closable
          duration={5000}
          showCountdown
          onClose={() => setShow(false)}
        />
      ) : (
        <Button size="sm" onClick={() => setShow(true)}>
          重新显示倒计时提示
        </Button>
      )}
    </div>
  )
}
