import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Steps } from '@expcat/tigercat-react/Steps'
import { StepsItem } from '@expcat/tigercat-react/StepsItem'

export default function App() {
  const [current, setCurrent] = useState(0)

  return (
    <div className="space-y-4">
      <Steps current={current} direction="vertical">
        <StepsItem title="创建订单" description="填写商品和地址" />
        <StepsItem title="确认支付" description="选择支付方式" />
        <StepsItem title="等待发货" description="查看物流进度" />
      </Steps>
      <div className="flex gap-2">
        <Button size="sm" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          上一步
        </Button>
        <Button size="sm" disabled={current === 2} onClick={() => setCurrent(current + 1)}>
          下一步
        </Button>
      </div>
    </div>
  )
}
