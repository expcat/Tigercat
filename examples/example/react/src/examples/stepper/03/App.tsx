import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [qty, setQty] = useState(10)

  return (
    <div className="space-y-3">
      <FormItem label="步长 5">
        <Stepper value={qty} onChange={setQty} min={0} max={100} step={5} />
      </FormItem>
      <FormItem label="禁用">
        <Stepper value={5} disabled />
      </FormItem>
    </div>
  )
}
