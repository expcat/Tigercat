import { useState } from 'react'
import { InputOTP } from '@expcat/tigercat-react/InputOTP'

export default function App() {
  const [value, setValue] = useState('')
  const [done, setDone] = useState('')

  return (
    <div className="w-full max-w-md space-y-3">
      <InputOTP
        value={value}
        onChange={setValue}
        onComplete={(code) => setDone(code)}
        length={6}
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">当前输入：{value || '暂无'}</p>
      {done && (
        <p className="text-sm text-green-600 dark:text-green-400">已完成：{done}</p>
      )}
    </div>
  )
}
