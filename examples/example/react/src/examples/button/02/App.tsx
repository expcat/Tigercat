import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <Button htmlType="button" variant="outline" onClick={() => setClickCount((count) => count + 1)}>
      已点击 {clickCount} 次
    </Button>
  )
}
