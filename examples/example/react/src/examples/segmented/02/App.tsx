import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react/Segmented'

const simpleOpts = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]

export default function App() {
  const [selected, setSelected] = useState<string | number>('daily')

  return (
    <>
      <Space direction="vertical" size={12} className="w-full">
        <Segmented size="sm" options={simpleOpts} value="a" />
        <Segmented size="md" options={simpleOpts} value="a" />
        <Segmented size="lg" options={simpleOpts} value="a" />
        <Segmented block options={simpleOpts} value="a" />
      </Space>
    </>
  )
}
