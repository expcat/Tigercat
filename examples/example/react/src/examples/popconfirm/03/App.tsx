import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Popconfirm } from '@expcat/tigercat-react/Popconfirm'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  const [lastAction, setLastAction] = useState('尚未确认或取消操作')

  const handleConfirm = () => {
    setLastAction('已确认删除记录')
  }

  const handleCancel = () => {
    setLastAction('已取消操作')
  }

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popconfirm
            open={visible1}
            onOpenChange={setVisible1}
            title="确定要执行此操作吗？"
            onConfirm={() => {
              handleConfirm()
              setVisible1(false)
            }}
            onCancel={() => {
              handleCancel()
              setVisible1(false)
            }}>
            <Button>受控弹窗</Button>
          </Popconfirm>

          <Button onClick={() => setVisible1(true)}>外部控制打开</Button>
        </Space>
      </div>
    </>
  )
}
