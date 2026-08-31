import { Divider } from '@expcat/tigercat-react/Divider'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <Space>
      <span>左侧</span>
      <Divider orientation="vertical" spacing="none" />
      <span>右侧</span>
    </Space>
  )
}
