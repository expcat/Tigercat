import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Popconfirm } from '@expcat/tigercat-react/Popconfirm'

export default function App() {
  const [result, setResult] = useState('等待操作')

  return (
    <div className="space-y-3">
      <Popconfirm
        title="删除这条记录？"
        description="删除后无法恢复。"
        okType="danger"
        okText="删除"
        onConfirm={() => setResult('已删除')}
        onCancel={() => setResult('已取消')}>
        <Button variant="secondary">删除记录</Button>
      </Popconfirm>
      <p className="text-sm text-gray-500" role="status">
        {result}
      </p>
    </div>
  )
}
