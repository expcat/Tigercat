import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'
import { useControlledState } from '@expcat/tigercat-react'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (next: number) => void
}

const Counter: React.FC<CounterProps> = ({ value, defaultValue = 0, onChange }) => {
  const isControlled = value !== undefined
  const [count, setCount] = useControlledState<number>(value, defaultValue, onChange)

  return (
    <Space>
      <Button onClick={() => setCount(count - 1)}>-</Button>
      <span className="w-10 text-center text-base font-medium">{count}</span>
      <Button onClick={() => setCount(count + 1)}>+</Button>
      <span className="text-xs text-gray-500">{isControlled ? '受控' : '非受控'}</span>
    </Space>
  )
}

export default function App() {
  const [external, setExternal] = useState(10)

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">非受控模式</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            只传入 defaultValue，组件内部维护状态。
          </p>
          <Card>
            <Counter defaultValue={5} />
          </Card>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">受控模式</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            传入 value 与 onChange，由父组件控制状态。
          </p>
          <Card>
            <Counter value={external} onChange={setExternal} />
            <div className="mt-3 text-sm text-gray-500">
              外部状态：<strong>{external}</strong>
            </div>
          </Card>
        </section>
      </div>
    </>
  )
}
