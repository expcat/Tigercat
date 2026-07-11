import { useState } from 'react'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'

export default function App() {
  const [value, setValue] = useState<number | null>(12.5)

  return (
    <div className="w-full max-w-xs space-y-2">
      <InputNumber
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        step={0.5}
        precision={1}
        size="lg"
        incrementAriaLabel="增加数值"
        decrementAriaLabel="减少数值"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">当前数值：{value ?? '未填写'}</p>
    </div>
  )
}
