import { useState } from 'react'
import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  const [items, setItems] = useState(['前端', '后端', '设计'])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Tag
          key={item}
          variant="primary"
          closable
          onClose={() => setItems((cur) => cur.filter((x) => x !== item))}>
          {item}
        </Tag>
      ))}
      {items.length === 0 && <span className="text-sm text-gray-500">已全部移除</span>}
    </div>
  )
}
