import { Statistic } from '@expcat/tigercat-react/Statistic'
import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  return (
    <>
      <Space size={32}>
        <Statistic title="日活用户" value={1128} prefix="↑" groupSeparator />
        <Statistic title="下单金额" value={250000} prefix="¥" groupSeparator />
        <Statistic title="好评率" value={98.5} suffix="%" size="lg" />
        <Statistic title="评论数" value={42} size="sm" />
      </Space>
    </>
  )
}
