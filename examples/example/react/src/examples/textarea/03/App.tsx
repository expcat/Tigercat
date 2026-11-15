import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'

export default function App() {
  const [value, setValue] = useState('这段说明太长了，已经超过上限')

  return (
    <Textarea
      aria-label="说明"
      value={value}
      onChange={setValue}
      status="error"
      errorMessage="请缩短说明"
      showCount
      maxLength={12}
      rows={4}
      className="w-full max-w-lg"
    />
  )
}
