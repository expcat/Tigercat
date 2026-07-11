import { useState } from 'react'
import { Rate } from '@expcat/tigercat-react/Rate'

export default function App() {
  const [value, setValue] = useState(3.5)

  return (
    <div className="space-y-2">
      <Rate value={value} onChange={setValue} allowHalf size="lg" character="★" />
      <p className="text-sm text-gray-500">当前评分：{value}</p>
    </div>
  )
}
