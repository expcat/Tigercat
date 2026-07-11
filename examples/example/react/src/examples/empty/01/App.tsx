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
          <Empty />
        </div>
        <div className="border rounded-lg p-6">
          <Empty preset="no-data" description="暂无数据" />
        </div>
        <div className="border rounded-lg p-6">
          <Empty preset="no-results" description="未找到匹配结果" />
        </div>
        <div className="border rounded-lg p-6">
          <Empty preset="error" description="加载出错了" />
        </div>
      </Space>
    </>
  )
}
