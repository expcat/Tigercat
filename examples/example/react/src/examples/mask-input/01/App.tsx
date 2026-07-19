import { useState } from 'react'
import { MaskInput } from '@expcat/tigercat-react/MaskInput'

export default function App() {
  const [date, setDate] = useState('')
  const [dateMasked, setDateMasked] = useState('')
  const [phone, setPhone] = useState('')

  return (
    <div className="w-full max-w-md space-y-3">
      <MaskInput
        mask="##/##/####"
        value={date}
        onChange={(raw, detail) => {
          setDate(raw)
          setDateMasked(detail.maskedValue)
        }}
        placeholder="MM/DD/YYYY"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        原始值：{date || '暂无'}；格式化：{dateMasked || '暂无'}
      </p>
      <MaskInput
        mask="(###) ###-####"
        value={phone}
        onChange={(raw) => setPhone(raw)}
        placeholder="(555) 123-4567"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">电话原始值：{phone || '暂无'}</p>
    </div>
  )
}
