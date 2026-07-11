import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  const [visible, setVisible] = useState(true)

  return visible ? (
    <Tag variant="primary" size="lg" closable onClose={() => setVisible(false)}>
      可关闭标签
    </Tag>
  ) : (
    <Button variant="ghost" onClick={() => setVisible(true)}>
      恢复标签
    </Button>
  )
}
