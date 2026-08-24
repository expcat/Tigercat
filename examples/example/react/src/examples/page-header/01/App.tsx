import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { PageHeader } from '@expcat/tigercat-react/PageHeader'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未操作')

  return (
    <div className="space-y-3">
      <PageHeader
        showBack
        title="订单详情"
        subTitle="SO-20260823-018"
        onBack={() => setLastAction('返回列表')}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setLastAction('取消')}>
              取消
            </Button>
            <Button size="sm" onClick={() => setLastAction('保存')}>
              保存
            </Button>
          </>
        }
      />
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}
