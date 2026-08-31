import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [value, setValue] = useState(2.5)
  const [fine, setFine] = useState(0.1)

  return (
    <div className="space-y-4">
      <FormItem label="数量">
        <Stepper
          value={value}
          onChange={setValue}
          min={0}
          max={10}
          step={0.5}
          precision={1}
          size="lg"
        />
      </FormItem>
      <FormItem label="步长 0.1">
        <Stepper value={fine} onChange={setFine} min={0} max={1} step={0.1} />
      </FormItem>
    </div>
  )
}
