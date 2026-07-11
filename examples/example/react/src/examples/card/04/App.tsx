import { useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未执行卡片操作')

  const recordAction = (action: string, target: string) => setLastAction(`${action}：${target}`)

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable variant="shadow">
            <h3 className="font-semibold mb-2">功能卡片 1</h3>
            <p className="text-gray-600 dark:text-gray-400">悬停查看效果</p>
          </Card>
          <Card hoverable variant="shadow">
            <h3 className="font-semibold mb-2">功能卡片 2</h3>
            <p className="text-gray-600 dark:text-gray-400">悬停查看效果</p>
          </Card>
          <Card hoverable variant="shadow">
            <h3 className="font-semibold mb-2">功能卡片 3</h3>
            <p className="text-gray-600 dark:text-gray-400">悬停查看效果</p>
          </Card>
        </div>
      </div>
    </>
  )
}
