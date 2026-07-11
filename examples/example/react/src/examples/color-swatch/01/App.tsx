import { useState } from 'react'
import { ColorSwatch } from '@expcat/tigercat-react/ColorSwatch'

const groups = [
  {
    label: '品牌色',
    colors: [
      { value: '#2563eb', label: '蓝色' },
      { value: '#0891b2', label: '青色' },
      { value: '#059669', label: '绿色' }
    ]
  },
  {
    label: '状态色',
    colors: [
      { value: '#f59e0b', label: '警告' },
      { value: '#dc2626', label: '错误' },
      { value: '#94a3b8', label: '禁用', disabled: true }
    ]
  }
]

export default function App() {
  const [color, setColor] = useState('#2563eb')

  return (
    <ColorSwatch
      value={color}
      onChange={setColor}
      groups={groups}
      columns={3}
      size="lg"
      ariaLabel="选择主题色"
    />
  )
}
