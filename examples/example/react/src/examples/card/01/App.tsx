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
        <Card>
          <p>这是一个基础的卡片组件，可以展示任何内容。</p>
        </Card>
      </div>
    </>
  )
}
