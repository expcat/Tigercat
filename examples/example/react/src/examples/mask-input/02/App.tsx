import { useState } from 'react'
import { MaskInput } from '@expcat/tigercat-react/MaskInput'

export default function App() {
  const [plate, setPlate] = useState('')

  return (
    <div className="w-full max-w-md space-y-2">
      <MaskInput
        mask="AA-####"
        tokens={{ A: { pattern: /[A-Za-z]/, transform: (c) => c.toUpperCase() } }}
        value={plate}
        onChange={(raw) => setPlate(raw)}
        placeholder="AB-1234"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        自定义 token(字母自动大写),原始值：{plate || '暂无'}
      </p>
    </div>
  )
}
