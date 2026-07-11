import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      autoResize
      minRows={2}
      maxRows={6}
      showCount
      maxLength={120}
      placeholder="自动扩展，并显示字符计数"
      className="w-full max-w-lg"
    />
  )
}
