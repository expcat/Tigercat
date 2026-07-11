import { Button } from '@expcat/tigercat-react/Button'
import { Result } from '@expcat/tigercat-react/Result'

export default function App() {
  return (
    <Result
      status="success"
      title="提交成功"
      subTitle="订单已经进入处理队列"
      extra={<Button variant="primary">查看订单</Button>}
    />
  )
}
