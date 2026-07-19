import { useState } from 'react'
import { InputOTP } from '@expcat/tigercat-react/InputOTP'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <div className="w-full max-w-md space-y-3">
      <InputOTP
        value={value}
        onChange={setValue}
        type="alphanumeric"
        masked
        groups={[3, 3]}
        separator="-"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        掩码模式 + 字母数字 + 3-3 分组，真实值：{value || '暂无'}
      </p>
    </div>
  )
}
