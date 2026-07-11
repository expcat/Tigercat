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
      <Space direction="vertical" size={12}>
        <Segmented
          value={selected}
          onChange={setSelected}
          options={[
            { label: '日', value: 'daily' },
            { label: '周', value: 'weekly' },
            { label: '月', value: 'monthly' },
            { label: '年', value: 'yearly' }
          ]}
        />
        <Text>当前选中: {String(selected)}</Text>
      </Space>
    </>
  )
}
