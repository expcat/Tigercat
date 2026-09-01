import { Button } from '@expcat/tigercat-react/Button'
import { Message } from '@expcat/tigercat-react'

export default function App() {
  const showMessages = () => {
    Message.success('保存成功')
    Message.info('已写入草稿箱')
  }

  return (
    <Button variant="primary" onClick={showMessages}>
      连续显示两条
    </Button>
  )
}
