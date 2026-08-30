import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { useControlledState } from '@expcat/tigercat-react'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
}

function Counter({ value, defaultValue = 0, onChange }: CounterProps) {
  const [count, setCount] = useControlledState({ value, defaultValue, onChange })

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setCount((current) => current - 1)}>-</Button>
      <span className="w-8 text-center font-medium">{count}</span>
      <Button onClick={() => setCount((current) => current + 1)}>+</Button>
    </div>
  )
}

export default function App() {
  const [count, setCount] = useState<number | undefined>(5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-[var(--tiger-text-muted,#6b7280)]">受控（可省略 value）</p>
        <Counter value={count} onChange={setCount} />
        <Button className="mt-2" onClick={() => setCount(undefined)}>
          省略 value
        </Button>
      </div>
      <div>
        <p className="mb-2 text-sm text-[var(--tiger-text-muted,#6b7280)]">非受控</p>
        <Counter defaultValue={0} />
      </div>
    </div>
  )
}
