import { Statistic } from '@expcat/tigercat-react/Statistic'
import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  return (
    <>
      <Space size={16}>
        <Card style={{ width: 200 }}>
          <Statistic title="总销量" value={8846} groupSeparator />
        </Card>
        <Card style={{ width: 200 }}>
          <Statistic title="月增长" value={12.5} suffix="%" prefix="↑" />
        </Card>
      </Space>
    </>
  )
}
