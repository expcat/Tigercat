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
          <Result status="403" title="403" subTitle="抱歉，您没有权限访问此页面" />
        </div>
        <div className="border rounded-lg p-6">
          <Result status="404" title="404" subTitle="抱歉，您访问的页面不存在" />
        </div>
        <div className="border rounded-lg p-6">
          <Result status="500" title="500" subTitle="服务器出错了，请稍后重试" />
        </div>
      </Space>
    </>
  )
}
