import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react/Segmented'

const options = [
  { label: '日', value: 'daily' },
  { label: '周', value: 'weekly' },
  { label: '月', value: 'monthly' },
  { label: '年', value: 'yearly', disabled: true }
]

export default function App() {
  const [value, setValue] = useState<string | number>('weekly')

  return <Segmented value={value} onChange={setValue} options={options} size="lg" block />
}
