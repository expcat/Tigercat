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
        <Input value={amount} readonly prefix="¥" placeholder="输入金额" />
        <NumberKeyboard
          mode="amount"
          value={amount}
          confirmText="完成"
          deleteText="退格"
          onChange={setAmount}
          onConfirm={(value) => setConfirmed(value)}
        />
        <p className="text-sm text-gray-500">{confirmed ? `已确认：¥${confirmed}` : '未确认'}</p>
      </div>
    </>
  )
}
