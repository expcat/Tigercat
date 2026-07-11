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
        <Space direction="vertical" size={16} className="w-full">
          <Card size="sm">
            <h3 className="font-semibold mb-2">小尺寸卡片 (sm)</h3>
            <p className="text-gray-600 dark:text-gray-400">内边距较小，适合紧凑布局。</p>
          </Card>
          <Card size="md">
            <h3 className="font-semibold mb-2">中等尺寸卡片 (md)</h3>
            <p className="text-gray-600 dark:text-gray-400">默认尺寸，适合大多数场景。</p>
          </Card>
          <Card size="lg">
            <h3 className="font-semibold mb-2">大尺寸卡片 (lg)</h3>
            <p className="text-gray-600 dark:text-gray-400">内边距较大，适合重要内容展示。</p>
          </Card>
          <Card padding={false}>
            <div className="bg-blue-50 text-blue-800 p-4 dark:bg-blue-900/30 dark:text-blue-300">
              无内边距卡片 (padding=false)
            </div>
          </Card>
          <Card padding="p-8">
            <h3 className="font-semibold mb-2">自定义大内边距 (padding="p-8")</h3>
            <p className="text-gray-600 dark:text-gray-400">使用自定 class 控制内边距。</p>
          </Card>
        </Space>
      </div>
    </>
  )
}
