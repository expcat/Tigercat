import React, { useState } from 'react'
import { useDrag, Card, Tag } from '@expcat/tigercat-react'
import type { DragItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'

interface TodoItem extends DragItem {
  title: string
}

const initialItems: TodoItem[] = [
  { id: '1', index: 0, title: '编写需求文档' },
  { id: '2', index: 1, title: '完成接口联调' },
  { id: '3', index: 2, title: '进行单元测试' },
  { id: '4', index: 3, title: '上线灰度发布' }
]

const reorderSnippet = `import { useDrag } from '@expcat/tigercat-react'
import type { DragItem } from '@expcat/tigercat-core'

interface TodoItem extends DragItem {
  title: string
}

const [items, setItems] = useState<TodoItem[]>(initial)

const drag = useDrag({
  onDrop: () => {
    const result = drag.reorder(items)
    if (result) {
      setItems(result.items.map((item, index) => ({ ...item, index })))
    }
  }
})

return (
  <div {...drag.getDropZoneProps()}>
    {items.map((item) => (
      <div key={item.id} {...drag.getDragItemProps(item)}>
        {item.title}
      </div>
    ))}
  </div>
)`

const UseDragDemo: React.FC = () => {
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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">useDrag 拖拽</h1>
        <p className="text-gray-600">
          框架无关的拖拽逻辑封装，提供 <code>getDragItemProps</code> / <code>getDropZoneProps</code>{' '}
          来快速绑定 HTML 拖拽事件。
        </p>
      </div>

      <DemoBlock
        title="基础列表排序"
        description="拖动条目即可重新排序，松开时通过 reorder() 计算新顺序。"
        code={reorderSnippet}>
        <div className="space-y-3" {...drag.getDropZoneProps()}>
          {items.map((item) => (
            <Card
              key={item.id}
              {...drag.getDragItemProps(item)}
              className="cursor-move select-none">
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
      </DemoBlock>
    </div>
  )
}

export default UseDragDemo
