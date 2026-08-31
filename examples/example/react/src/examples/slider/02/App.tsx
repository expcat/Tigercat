import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [range, setRange] = useState<number | [number, number]>([20, 70])

  return (
    <div className="w-full max-w-lg space-y-2">
      <FormItem label="价格区间">
        <Slider range value={range} onChange={setRange} min={0} max={100} step={10} />
      </FormItem>
      <p className="text-sm text-gray-600 dark:text-gray-300">选择范围：{String(range)}</p>
    </div>
  )
}
