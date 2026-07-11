import { useState } from 'react'
import { Transfer } from '@expcat/tigercat-react/Transfer'

const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `内容 ${i + 1}`,
  description: `描述 ${i + 1}`
}))

export default function App() {
  const [targetKeys1, setTargetKeys1] = useState<(string | number)[]>(['3', '4'])

  const [targetKeys2, setTargetKeys2] = useState<(string | number)[]>(['3', '4'])

  return (
    <>
      <Transfer targetKeys={targetKeys1} onChange={setTargetKeys1} dataSource={dataSource} />
    </>
  )
}
