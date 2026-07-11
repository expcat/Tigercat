import { useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { Tag } from '@expcat/tigercat-react/Tag'
import { useDrag } from '@expcat/tigercat-react'
import type { DragItem } from '@expcat/tigercat-core'

interface TodoItem extends DragItem {
  title: string
}

const initialItems: TodoItem[] = [
  { id: '1', index: 0, title: '编写需求文档' },
  { id: '2', index: 1, title: '完成接口联调' },
  { id: '3', index: 2, title: '进行单元测试' },
  { id: '4', index: 3, title: '上线灰度发布' }
]

export default function App() {
  const [items, setItems] = useState<TodoItem[]>(initialItems)

  const drag = useDrag({
    onDrop: () => {
      const result = drag.reorder(items)
      if (result) {
        setItems(result.items.map((item, index) => ({ ...item, index })))
      }
    }
  })

  const draggedTitle = drag.draggedItem
    ? (items.find((it) => it.id === drag.draggedItem!.id)?.title ?? '无')
    : '无'

  return (
    <>
      <div className="space-y-3" {...drag.getDropZoneProps()}>
        {items.map((item) => (
          <Card key={item.id} {...drag.getDragItemProps(item)} className="cursor-move select-none">
            <div className="flex items-center justify-between">
              <span>{item.title}</span>
              <Tag color="blue">序号 {item.index + 1}</Tag>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        当前拖拽：<strong>{draggedTitle}</strong>
      </div>
    </>
  )
}
