import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      rows={4}
      size="lg"
      placeholder="请输入说明"
      className="w-full max-w-lg"
    />
  )
}
