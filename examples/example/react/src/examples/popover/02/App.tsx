import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { List } from '@expcat/tigercat-react/List'
import { useState } from 'react'
import { Popover } from '@expcat/tigercat-react/Popover'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  const [manualVisible, setManualVisible] = useState(false)

  const customContentItems = ['列表项 1', '列表项 2', '列表项 3']

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popover
            open={visible1}
            onOpenChange={setVisible1}
            title="受控气泡卡片"
            content="通过外部状态控制显示">
            <Button>受控气泡卡片</Button>
          </Popover>

          <Button onClick={() => setVisible1(!visible1)}>{visible1 ? '隐藏' : '显示'}</Button>
        </Space>
      </div>
    </>
  )
}
