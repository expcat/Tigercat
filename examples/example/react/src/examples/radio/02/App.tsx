import { useState } from 'react'
import { Radio } from '@expcat/tigercat-react/Radio'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'

export default function App() {
  const [value, setValue] = useState<string | number>('monthly')

  return (
    <RadioGroup value={value} onChange={setValue} className="flex flex-wrap gap-4">
      <Radio value="monthly">按月</Radio>
      <Radio value="yearly">按年</Radio>
      <Radio value="once">一次性</Radio>
    </RadioGroup>
  )
}
