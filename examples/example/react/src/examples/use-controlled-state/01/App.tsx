import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { useControlledState } from '@expcat/tigercat-react'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
}

function Counter({ value, defaultValue = 0, onChange }: CounterProps) {
  const [count, setCount] = useControlledState(value, defaultValue, onChange)

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setCount(count - 1)}>-</Button>
      <span className="w-8 text-center font-medium">{count}</span>
      <Button onClick={() => setCount(count + 1)}>+</Button>
    </div>
  )
}

export default function App() {
  const [count, setCount] = useState(5)

  return <Counter value={count} onChange={setCount} />
}
