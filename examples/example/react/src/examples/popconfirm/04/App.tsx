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
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">隐藏图标</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Popconfirm
              title="确定要继续吗？"
              showIcon={false}
              onConfirm={() => setLastAction('已确认继续')}>
              <Button>无图标</Button>
            </Popconfirm>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space>
              <Popconfirm title="此操作已禁用" disabled>
                <Button variant="secondary" disabled>
                  禁用按钮
                </Button>
              </Popconfirm>

              <Popconfirm title="Popconfirm 已禁用" disabled>
                <Button>按钮未禁用</Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </div>
    </>
  )
}
