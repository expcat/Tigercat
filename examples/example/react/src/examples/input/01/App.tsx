import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [value, setValue] = useState('')

  return (
    <div className="w-full max-w-md space-y-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        type="search"
        size="lg"
        prefix="🔎"
        suffix="⌘K"
        placeholder="搜索组件"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">当前输入：{value || '暂无'}</p>
    </div>
  )
}
