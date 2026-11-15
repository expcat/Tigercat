import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <Textarea
      aria-label="说明"
      value={value}
      onChange={setValue}
      rows={4}
      size="lg"
      placeholder="请输入说明"
      className="w-full max-w-lg"
    />
  )
}
