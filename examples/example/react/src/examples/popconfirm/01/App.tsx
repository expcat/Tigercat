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
        <Popconfirm
          title="确定要删除这条记录吗？"
          onConfirm={handleConfirm}
          onCancel={handleCancel}>
          <Button variant="secondary">删除</Button>
        </Popconfirm>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300" role="status">
          操作反馈：{lastAction}
        </p>
      </div>
    </>
  )
}
