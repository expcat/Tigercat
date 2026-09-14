import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'

export default function App() {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <div className="max-w-sm space-y-3">
      <FormItem name="amount" label="金额">
        <Input
          value={value}
          prefix="¥"
          placeholder="输入金额"
          inputMode="none"
          onChange={(v) => setValue(String(v ?? ''))}
          onFocus={() => setOpen(true)}
        />
      </FormItem>
      <NumberKeyboard
        mode="amount"
        precision={2}
        value={value}
        onChange={(v) => setValue(String(v ?? ''))}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => setOpen(false)}
      />
    </div>
  )
}
