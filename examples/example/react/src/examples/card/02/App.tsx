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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default">
            <h3 className="font-semibold mb-2">默认卡片</h3>
            <p className="text-gray-600 dark:text-gray-400">带细边框的基础卡片样式。</p>
          </Card>
          <Card variant="bordered">
            <h3 className="font-semibold mb-2">带边框卡片</h3>
            <p className="text-gray-600 dark:text-gray-400">带粗边框的卡片样式。</p>
          </Card>
          <Card variant="shadow">
            <h3 className="font-semibold mb-2">带阴影卡片</h3>
            <p className="text-gray-600 dark:text-gray-400">带阴影效果的卡片样式。</p>
          </Card>
          <Card variant="elevated">
            <h3 className="font-semibold mb-2">浮起卡片</h3>
            <p className="text-gray-600 dark:text-gray-400">带大阴影的浮起卡片样式。</p>
          </Card>
        </div>
      </div>
    </>
  )
}
