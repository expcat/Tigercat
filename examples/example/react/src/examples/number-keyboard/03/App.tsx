import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'
import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [amount, setAmount] = useState('')

  const [phone, setPhone] = useState('')

  const [idCard, setIdCard] = useState('')

  const [confirmed, setConfirmed] = useState('')

  return (
    <>
      <div className="max-w-sm space-y-3">
        <Input value={idCard} readonly placeholder="身份证号" />
        <NumberKeyboard
          mode="id-card"
          value={idCard}
          onChange={setIdCard}
          confirmText="完成"
          deleteText="退格"
        />
      </div>
    </>
  )
}
