import { useState } from 'react'
import { Empty } from '@expcat/tigercat-react/Empty'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未执行操作')

  return (
    <>
      <Space direction="vertical" size={24} className="w-full">
        <div className="border rounded-lg p-6">
          <Empty
            description="这里什么都没有"
            extra={
              <Button variant="primary" onClick={() => setLastAction('已创建一条新内容')}>
                立即创建
              </Button>
            }
          />
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300" role="status">
            操作反馈：{lastAction}
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <Empty showImage={false} description="无图片模式，仅显示文字描述" />
        </div>
      </Space>
    </>
  )
}
