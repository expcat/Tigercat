import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'

export default function App() {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <div className="max-w-sm space-y-3">
      <Input
        value={value}
        placeholder="手机号"
        inputMode="none"
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setOpen(true)}
      />
      <NumberKeyboard
        mode="phone"
        value={value}
        onChange={setValue}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => setOpen(false)}
      />
    </div>
  )
}
