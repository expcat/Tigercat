import { useState } from 'react'
import { Mentions } from '@expcat/tigercat-react/Mentions'

const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]

export default function App() {
  const [value, setValue] = useState('')

  return (
    <Mentions
      value={value}
      onChange={setValue}
      options={users}
      placeholder="输入 @ 提及成员"
      className="w-full max-w-lg"
    />
  )
}
