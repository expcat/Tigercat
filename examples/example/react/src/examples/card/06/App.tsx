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
          <Card
            header={<h3 className="text-lg font-semibold">卡片标题</h3>}
            footer={<p className="text-sm text-gray-500">创建于 2024-01-01</p>}>
            <p className="text-gray-600 dark:text-gray-400">
              这是卡片的主体内容区域，可以放置任何内容。
            </p>
          </Card>

          <Card
            header={<h3 className="text-lg font-semibold">操作卡片</h3>}
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => recordAction('取消', '操作卡片')}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => recordAction('确认', '操作卡片')}>
                  确认
                </Button>
              </>
            }>
            <p className="text-gray-600 dark:text-gray-400">这个卡片包含操作按钮。</p>
          </Card>
        </div>
      </div>
    </>
  )
}
