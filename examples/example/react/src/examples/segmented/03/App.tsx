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
      <Segmented value={value} onChange={setValue} options={options} block aria-label="任务筛选" />
      <Segmented value="active" options={options} disabled aria-label="禁用筛选" />
      <div dir="rtl">
        <Segmented value={value} onChange={setValue} options={options} aria-label="RTL" />
      </div>
      <p className="text-sm text-gray-500">block 撑满容器宽度；disabled 禁用整个控件。</p>
    </div>
  )
}
