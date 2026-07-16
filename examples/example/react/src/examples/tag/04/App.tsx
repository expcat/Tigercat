import { useState } from 'react'
import { Tag } from '@expcat/tigercat-react/Tag'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [items, setItems] = useState(['前端', '后端', '设计', '测试'])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {sizes.map((size) => (
          <Tag key={size} variant="primary" size={size}>
            尺寸 {size}
          </Tag>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((t) => (
          <Tag
            key={t}
            variant="info"
            closable
            onClose={() => setItems((cur) => cur.filter((x) => x !== t))}>
            {t}
          </Tag>
        ))}
        {items.length === 0 && <span className="text-sm text-gray-500">已全部移除</span>}
      </div>
    </div>
  )
}
