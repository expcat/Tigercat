import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'

export default function App() {
  const [value, setValue] = useState<number | [number, number]>(40)

  return (
    <div className="w-full max-w-lg space-y-2">
      <Slider value={value} onChange={setValue} min={0} max={100} step={5} />
      <p className="text-sm text-gray-600 dark:text-gray-300">当前值：{String(value)}</p>
    </div>
  )
}
