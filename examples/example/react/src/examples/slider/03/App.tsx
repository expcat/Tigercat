import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'

const marks = { 0: '0°', 25: '25°', 50: '50°', 75: '75°', 100: '100°' }

export default function App() {
  const [a, setA] = useState<number | [number, number]>(50)
  const [b, setB] = useState<number | [number, number]>(30)

  return (
    <div className="w-full max-w-lg space-y-8">
      <div>
        <p className="mb-2 text-sm text-gray-500">marks（对象：自定义刻度文案）</p>
        <Slider value={a} onChange={setA} marks={marks} step={25} />
      </div>
      <div>
        <p className="mb-2 text-sm text-gray-500">marks（true：按 step 自动刻度）</p>
        <Slider value={b} onChange={setB} marks step={10} />
      </div>
    </div>
  )
}
