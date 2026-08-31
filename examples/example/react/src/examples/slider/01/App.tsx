import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [value, setValue] = useState<number | [number, number]>(40)

  return (
    <div className="w-full max-w-lg space-y-2">
      <FormItem label="音量">
        <Slider value={value} onChange={setValue} min={0} max={100} step={5} />
      </FormItem>
      <p className="text-sm text-gray-600 dark:text-gray-300">当前值：{String(value)}</p>
    </div>
  )
}
