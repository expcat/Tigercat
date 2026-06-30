import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'
import { useControlledState } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './UseControlledStateDemo.tsx?raw'

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

const snippet = `import { useControlledState } from '@expcat/tigercat-react'

interface CounterProps {
  value?: number
  defaultValue?: number
  onChange?: (next: number) => void
}

const Counter: React.FC<CounterProps> = ({ value, defaultValue = 0, onChange }) => {
  const [count, setCount] = useControlledState<number>(value, defaultValue, onChange)

  return (
    <button onClick={() => setCount(count + 1)}>{count}</button>
  )
}`

const controlledScriptSnippet = `const [external, setExternal] = useState(10)`

const UseControlledStateDemo: React.FC = () => {
  const [external, setExternal] = useState(10)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">useControlledState 受控/非受控</h1>
        <p className="text-gray-600 dark:text-gray-400">
          统一处理表单组件「受控 / 非受控」两种用法的样板代码，避免重复 if/else。
        </p>
      </div>

      <DemoBlock
        title="非受控模式"
        description="只传入 defaultValue，组件内部维护状态。"
        code={fullPageSnippet}>
        <Card>
          <Counter defaultValue={5} />
        </Card>
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="传入 value 与 onChange，由父组件控制状态。"
        code={fullPageSnippet}>
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
