import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Mentions } from '@expcat/tigercat-react/Mentions'

const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' }
]

export default function App() {
  const [val, setVal] = useState('')

  const [val2, setVal2] = useState('')

  return (
    <>
      <Mentions
        value={val2}
        onChange={setVal2}
        options={users}
        prefix="#"
        placeholder="输入 # 提及话题"
      />
    </>
  )
}
