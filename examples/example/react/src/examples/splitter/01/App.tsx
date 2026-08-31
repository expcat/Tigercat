import { useState } from 'react'
import { Splitter } from '@expcat/tigercat-react/Splitter'

export default function App() {
  const [sizes, setSizes] = useState<(number | string)[]>(['30%', '70%'])

  return (
    <Splitter
      direction="horizontal"
      sizes={sizes}
      gutterSize={6}
      onSizesChange={setSizes}
      style={{ height: 200, border: '1px solid var(--tiger-border, #e5e7eb)', borderRadius: 8 }}>
      <div className="p-4">左侧 30%</div>
      <div className="p-4">右侧 70%</div>
    </Splitter>
  )
}
