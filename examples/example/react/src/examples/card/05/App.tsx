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
          <Card
            cover="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"
            coverAlt="代码编辑器">
            <h3 className="font-semibold mb-2">开发工具</h3>
            <p className="text-gray-600 dark:text-gray-400">现代化的开发环境</p>
          </Card>
          <Card
            cover="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop"
            coverAlt="笔记本电脑">
            <h3 className="font-semibold mb-2">移动办公</h3>
            <p className="text-gray-600 dark:text-gray-400">随时随地高效工作</p>
          </Card>
          <Card
            cover="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
            coverAlt="数据分析">
            <h3 className="font-semibold mb-2">数据分析</h3>
            <p className="text-gray-600 dark:text-gray-400">洞察数据价值</p>
          </Card>
        </div>
      </div>
    </>
  )
}
