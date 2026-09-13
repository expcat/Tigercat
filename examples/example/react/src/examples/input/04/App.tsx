import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [value, setValue] = useState('hello')

  return (
    <div className="w-full max-w-md space-y-2">
      <Input
        value={value}
        onChange={setValue}
        showCount
        maxLength={20}
        placeholder="字数统计"
      />
    </div>
  )
}
