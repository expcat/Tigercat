import { useState } from 'react'
import { Alert } from '@expcat/tigercat-react/Alert'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [visible, setVisible] = useState(true)

  return visible ? (
    <Alert
      type="success"
      title="配置已保存"
      description="点击关闭按钮隐藏提示。"
      closable
      closeAriaLabel="关闭保存提示"
      onClose={() => setVisible(false)}
    />
  ) : (
    <Button size="sm" onClick={() => setVisible(true)}>
      重新显示
    </Button>
  )
}
