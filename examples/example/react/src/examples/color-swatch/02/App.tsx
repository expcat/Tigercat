import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { ColorSwatch } from '@expcat/tigercat-react/ColorSwatch'

const brandGroups = [
  {
    label: 'Brand',
    colors: [
      { value: '#0f172a', label: 'Ink' },
      { value: '#2563eb', label: 'Blue' },
      { value: '#0891b2', label: 'Cyan' },
      { value: '#059669', label: 'Green' }
    ]
  },
  {
    label: 'Neutral',
    colors: ['#f8fafc', '#cbd5e1', '#64748b', '#1e293b']
  }
]

export default function App() {
  const [color, setColor] = useState('#3b82f6')

  const [brandColor, setBrandColor] = useState('#2563eb')

  const [statusColor, setStatusColor] = useState('#16a34a')

  return (
    <>
      <Space direction="vertical" size={16}>
        <ColorSwatch value={brandColor} onChange={setBrandColor} groups={brandGroups} columns={4} />
        <ColorSwatch
          value={statusColor}
          onChange={setStatusColor}
          colors={[
            { value: '#16a34a', label: 'Success' },
            { value: '#f59e0b', label: 'Warning' },
            { value: '#dc2626', label: 'Danger', disabled: true }
          ]}
        />
        <Space size={12} align="center">
          <ColorSwatch value="#64748b" size="sm" disabled />
          <Text>禁用状态</Text>
        </Space>
      </Space>
    </>
  )
}
