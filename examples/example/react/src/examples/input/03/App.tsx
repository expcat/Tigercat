import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [value, setValue] = useState('secret')

  return (
    <div className="w-full max-w-md space-y-2">
      <Input
        type="password"
        showPassword
        clearable
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="密码"
      />
    </div>
  )
}
