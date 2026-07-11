import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <div className="max-w-sm space-y-3">
      <Input value={value} readonly placeholder="身份证号" />
      <NumberKeyboard
        mode="id-card"
        value={value}
        onChange={setValue}
        confirmText="完成"
        deleteText="退格"
      />
    </div>
  )
}
