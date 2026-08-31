import { useState } from 'react'
import { Badge } from '@expcat/tigercat-react/Badge'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [count, setCount] = useState(5)

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Badge content={count} standalone={false} position="bottom-right" variant="danger">
        <Button variant="outline" aria-label={`消息 ${count} 条`}>
          消息
        </Button>
      </Badge>
      <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
        清零
      </Button>
      <div dir="rtl">
        <Badge content={3} standalone={false} position="top-right">
          <Button variant="outline" aria-label="通知 3 条">
            通知
          </Button>
        </Badge>
      </div>
    </div>
  )
}
