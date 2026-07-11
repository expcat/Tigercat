import { useState } from 'react'
import { Result } from '@expcat/tigercat-react/Result'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未执行操作')

  return (
    <>
      <Space direction="vertical" size={24} className="w-full">
        <div className="border rounded-lg p-6">
          <Result status="success" title="操作成功" subTitle="订单已提交，预计2小时内送达" />
        </div>
        <div className="border rounded-lg p-6">
          <Result status="error" title="提交失败" subTitle="请检查网络连接后重试" />
        </div>
        <div className="border rounded-lg p-6">
          <Result status="warning" title="警告提示" subTitle="当前操作存在风险" />
        </div>
        <div className="border rounded-lg p-6">
          <Result status="info" title="提示信息" subTitle="这是一条普通信息提示" />
        </div>
      </Space>
    </>
  )
}
