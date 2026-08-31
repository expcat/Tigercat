import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react/Switch'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [on, setOn] = useState(true)

  return (
    <div className="flex items-center gap-6">
      {sizes.map((size) => (
        <Switch key={size} checked={on} onChange={setOn} size={size}>
          {size}
        </Switch>
      ))}
    </div>
  )
}
