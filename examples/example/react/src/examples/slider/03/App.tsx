import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'
import { FormItem } from '@expcat/tigercat-react/FormItem'

const marks = { 0: '0°', 25: '25°', 50: '50°', 75: '75°', 100: '100°' }

export default function App() {
  const [a, setA] = useState<number | [number, number]>(50)
  const [b, setB] = useState<number | [number, number]>(30)

  return (
    <div className="w-full max-w-lg space-y-8">
      <FormItem label="自定义刻度">
        <Slider value={a} onChange={setA} marks={marks} step={25} />
      </FormItem>
      <FormItem label="按 step 自动刻度">
        <Slider value={b} onChange={setB} marks step={10} />
      </FormItem>
    </div>
  )
}
