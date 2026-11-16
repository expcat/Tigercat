import { useState } from 'react'
import { Rate } from '@expcat/tigercat-react/Rate'

export default function App() {
  const [mood, setMood] = useState(4)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-gray-500">自定义</span>
        <Rate value={mood} onChange={setMood} character="♥" allowClear aria-label="自定义评分" />
      </div>
      <p className="text-sm text-gray-500">
        character 渲染文本或 emoji；allowClear 时再次点击当前值可清零。
      </p>
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-gray-500">只读</span>
        <Rate value={4.5} readOnly allowHalf aria-label="只读评分" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-gray-500">禁用</span>
        <Rate value={2} disabled aria-label="禁用评分" />
      </div>
    </div>
  )
}
