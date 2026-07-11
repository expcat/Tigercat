import { useState } from 'react'
import { Radio } from '@expcat/tigercat-react/Radio'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'

export default function App() {
  const [lastValue, setLastValue] = useState<string | number>('standard')

  return (
    <div className="space-y-2">
      <RadioGroup defaultValue="standard" onChange={setLastValue} className="flex flex-wrap gap-4">
        <Radio value="standard">标准</Radio>
        <Radio value="express">加急</Radio>
      </RadioGroup>
      <p className="text-sm text-gray-600 dark:text-gray-300">最近选择：{lastValue}</p>
    </div>
  )
}
