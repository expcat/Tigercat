import { Button } from '@expcat/tigercat-react/Button'
import { Empty } from '@expcat/tigercat-react/Empty'

export default function App() {
  return (
    <Empty
      preset="no-results"
      description="没有匹配的搜索结果"
      extra={<Button variant="primary">清除筛选</Button>}
    />
  )
}
