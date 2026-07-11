import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  return (
    <>
      <Space size={16}>
        <Tooltip open={visible1} content="受控的气泡提示" onOpenChange={setVisible1}>
          <Button>受控提示</Button>
        </Tooltip>

        <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '隐藏' : '显示'}</Button>
      </Space>
    </>
  )
}
