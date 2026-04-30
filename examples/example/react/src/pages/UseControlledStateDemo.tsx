import React, { useState } from 'react'
import { useControlledState, Button, Space, Card } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (next: number) => void
}

const Counter: React.FC<CounterProps> = ({ value, defaultValue = 0, onChange }) => {
  const [count, setCount, isControlled] = useControlledState<number>(value, defaultValue)

  const update = (next: number) => {
    if (!isControlled) setCount(next)
    onChange?.(next)
  }

  return (
    <Space>
      <Button onClick={() => update(count - 1)}>-</Button>
      <span className="w-10 text-center text-base font-medium">{count}</span>
      <Button onClick={() => update(count + 1)}>+</Button>
      <span className="text-xs text-gray-500">{isControlled ? '受控' : '非受控'}</span>
    </Space>
  )
}

const snippet = `import { useControlledState } from '@expcat/tigercat-react'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (next: number) => void
}

const Counter: React.FC<CounterProps> = ({ value, defaultValue = 0, onChange }) => {
  const [count, setCount, isControlled] = useControlledState<number>(value, defaultValue)

  const update = (next: number) => {
    if (!isControlled) setCount(next)
    onChange?.(next)
  }

  return (
    <button onClick={() => update(count + 1)}>{count}</button>
  )
}`

const UseControlledStateDemo: React.FC = () => {
  const [external, setExternal] = useState(10)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">useControlledState 受控/非受控</h1>
        <p className="text-gray-600">
          统一处理表单组件「受控 / 非受控」两种用法的样板代码，避免重复 if/else。
        </p>
      </div>

      <DemoBlock
        title="非受控模式"
        description="只传入 defaultValue，组件内部维护状态。"
        code={snippet}>
        <Card>
          <Counter defaultValue={5} />
        </Card>
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="传入 value 与 onChange，由父组件控制状态。"
        code={snippet}>
        <Card>
          <Counter value={external} onChange={setExternal} />
          <div className="mt-3 text-sm text-gray-500">
            外部状态：<strong>{external}</strong>
          </div>
        </Card>
      </DemoBlock>
    </div>
  )
}

export default UseControlledStateDemo
