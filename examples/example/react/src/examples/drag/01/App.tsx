import { useState } from 'react'
import { Drag } from '@expcat/tigercat-react/Drag'
import type { DragItem } from '@expcat/tigercat-core'

interface Todo extends DragItem {
  title: string
}

export default function App() {
  const [items, setItems] = useState<Todo[]>([
    { id: '1', index: 0, title: '编写需求' },
    { id: '2', index: 1, title: '接口联调' },
    { id: '3', index: 2, title: '发布' }
  ])

  return (
    <Drag
      items={items}
      containerId="todos"
      onItemsChange={(next) => setItems(next as Todo[])}
      renderItem={(item, { dragItemProps }) => (
        <li
          {...dragItemProps}
          className="mb-2 cursor-grab rounded-md border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2">
          {item.title}
        </li>
      )}
    />
  )
}
