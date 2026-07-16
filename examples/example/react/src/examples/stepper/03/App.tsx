import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'

export default function App() {
  const [qty, setQty] = useState(10)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-gray-500">步长 5</span>
        <Stepper value={qty} onChange={setQty} min={0} max={100} step={5} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-gray-500">禁用</span>
        <Stepper value={5} disabled />
      </div>
      <p className="text-sm text-gray-500">min/max 限制范围，step 控制增减步长。</p>
    </div>
  )
}
