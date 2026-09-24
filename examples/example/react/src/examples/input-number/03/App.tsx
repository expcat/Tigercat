import { useState } from 'react'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'

export default function App() {
  const [value, setValue] = useState<number | string | null>('9007199254740993')
  return (
    <div className="w-full max-w-sm">
      <InputNumber aria-label="Big integer" value={value} onChange={setValue} />
      <p className="mt-2 text-sm">
        {typeof value} {String(value)}
      </p>
    </div>
  )
}
