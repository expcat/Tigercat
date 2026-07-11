import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { Rate } from '@expcat/tigercat-react/Rate'

export default function App() {
  const [val, setVal] = useState(3)

  const [halfVal, setHalfVal] = useState(2.5)

  const [customVal, setCustomVal] = useState(4)

  return (
    <>
      <Space direction="vertical" size={16}>
        <Rate value={val} onChange={setVal} />
        <Rate value={halfVal} onChange={setHalfVal} allowHalf />
        <Text>当前值: {halfVal}</Text>
      </Space>
    </>
  )
}
