import { useState } from 'react'
import { Result } from '@expcat/tigercat-react/Result'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未执行操作')

  return (
    <>
      <div className="border rounded-lg p-6">
        <Result
          status="success"
          title="购买成功"
          extra={
            <Space>
              <Button variant="primary" onClick={() => setLastAction('已选择返回首页')}>
                返回首页
              </Button>
              <Button variant="secondary" onClick={() => setLastAction('正在查看订单详情')}>
                查看订单
              </Button>
            </Space>
          }
        />
        <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300" role="status">
          操作反馈：{lastAction}
        </p>
      </div>
    </>
  )
}
