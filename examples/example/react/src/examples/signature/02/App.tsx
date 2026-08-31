import { useState } from 'react'
import { Signature } from '@expcat/tigercat-react/Signature'

export default function App() {
  const [red, setRed] = useState('')
  const [dark, setDark] = useState('')

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-[280px] space-y-1">
        <Signature
          width={280}
          height={140}
          penColor="#dc2626"
          lineWidth={2}
          value={red}
          onChange={setRed}
        />
        <p className="text-xs text-[var(--tiger-text-muted,#6b7280)]">penColor 红 · lineWidth 2</p>
      </div>
      <div className="w-[280px] space-y-1">
        <Signature
          width={280}
          height={140}
          penColor="#f8fafc"
          backgroundColor="#0f172a"
          lineWidth={4}
          value={dark}
          onChange={setDark}
        />
        <p className="text-xs text-[var(--tiger-text-muted,#6b7280)]">
          backgroundColor 深色 · lineWidth 4
        </p>
      </div>
    </div>
  )
}
