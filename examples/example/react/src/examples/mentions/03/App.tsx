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
      <Space direction="vertical" size={12} className="w-full">
        <Mentions options={users} size="sm" placeholder="小尺寸" />
        <Mentions options={users} size="lg" placeholder="大尺寸" />
        <Mentions options={users} disabled placeholder="禁用" />
      </Space>
    </>
  )
}
