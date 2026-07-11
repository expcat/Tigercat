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
      <Space direction="vertical" size={12}>
        <Rate value={customVal} onChange={setCustomVal} character="♥" />
        <Rate value={4} count={10} disabled />
        <Rate value={3} disabled />
      </Space>
    </>
  )
}
