import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react/Segmented'

const options = [
  { label: '列表', value: 'list' },
  { label: '看板', value: 'board' },
  { label: '日历', value: 'calendar' }
]
const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState<string | number>('list')

  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <Segmented key={size} value={value} onChange={setValue} options={options} size={size} />
      ))}
    </div>
  )
}
