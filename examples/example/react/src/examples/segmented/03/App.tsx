import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react/Segmented'

const options = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' }
]

export default function App() {
  const [value, setValue] = useState<string | number>('all')

  return (
    <div className="space-y-3">
      <Segmented value={value} onChange={setValue} options={options} block />
      <Segmented value="active" options={options} disabled />
      <p className="text-sm text-gray-500">block 撑满容器宽度；disabled 禁用整个控件。</p>
    </div>
  )
}
