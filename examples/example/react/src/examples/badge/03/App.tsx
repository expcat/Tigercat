import { Badge } from '@expcat/tigercat-react/Badge'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  return (
    <Badge content={5} standalone={false} position="bottom-right" variant="danger">
      <Button variant="outline">消息</Button>
    </Badge>
  )
}
