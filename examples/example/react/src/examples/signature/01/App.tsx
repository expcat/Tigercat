import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Signature } from '@expcat/tigercat-react/Signature'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <div className="w-full max-w-[320px] space-y-2">
      <FormItem name="sign" label="合同签名">
        <Signature value={value} onChange={setValue} exportType="image/jpeg" />
      </FormItem>
      <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
        {value ? '已签名（受控值为 SVG data URL）' : '等待签名'}
      </p>
      {value ? (
        <img
          src={value}
          alt=""
          className="w-full rounded border border-[var(--tiger-border,#d1d5db)]"
        />
      ) : null}
    </div>
  )
}
