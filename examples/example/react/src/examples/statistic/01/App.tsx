import { Statistic } from '@expcat/tigercat-react/Statistic'
import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  return (
    <>
      <Space size={32}>
        <Statistic title="活跃用户" value={112893} />
        <Statistic title="收入 (CNY)" value={89320.5} precision={2} />
        <Statistic title="完成率" value={93.8} suffix="%" />
      </Space>
    </>
  )
}
