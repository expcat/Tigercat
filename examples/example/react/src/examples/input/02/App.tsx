import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [value, setValue] = useState('可清除的内容')

  return (
    <div className="w-full max-w-md space-y-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        clearable
        placeholder="输入后显示清除按钮"
      />
    </div>
  )
}
