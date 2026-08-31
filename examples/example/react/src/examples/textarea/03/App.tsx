import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'

export default function App() {
  const [value, setValue] = useState('这段说明太长了，超过上限')

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      status="error"
      errorMessage="请缩短说明"
      showCount
      maxLength={12}
      rows={4}
      className="w-full max-w-lg"
    />
  )
}
