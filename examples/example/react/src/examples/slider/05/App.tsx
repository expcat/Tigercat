import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'

export default function App() {
  const [value, setValue] = useState(30)
  return (
    <Slider
      aria-label="Volume"
      className="w-full max-w-sm"
      formatTooltip={(next) => `${next}%`}
      marks={{ 0: '0', 50: '50', 100: '100' }}
      value={value}
      onChange={(next) => {
        if (typeof next === 'number') setValue(next)
      }}
    />
  )
}
