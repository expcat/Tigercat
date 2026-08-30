import { useState } from 'react'
import { Tag } from '@expcat/tigercat-react/Tag'
import { useDrag } from '@expcat/tigercat-react'
import { reorderSequence, type DragItem } from '@expcat/tigercat-core'

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
    containerId: 'todos',
    onDrop: (event) => {
      if (event.fromIndex === event.toIndex) return
      setItems(
        reorderSequence(items, event.fromIndex, event.toIndex).map((item, index) => ({
          ...item,
          index
        }))
      )
    }
  })

  const moveBy = (from: number, delta: number) => {
    const to = from + delta
    if (to < 0 || to >= items.length) return
    setItems(reorderSequence(items, from, to).map((item, index) => ({ ...item, index })))
  }

  const draggedTitle = drag.draggedItem
    ? (items.find((it) => it.id === drag.draggedItem!.id)?.title ?? '无')
    : '无'

  return (
    <>
      <ul className="m-0 list-none space-y-3 p-0" {...drag.getDropZoneProps()}>
        {items.map((item, index) => {
          const { className: dragClass, ...itemProps } = drag.getDragItemProps(item)
          return (
            <li
              key={item.id}
              {...itemProps}
              className={[
                'flex cursor-grab items-center justify-between rounded-md border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#fff)] px-3 py-2 select-none',
                dragClass
              ]
                .filter(Boolean)
                .join(' ')}>
              <span>{item.title}</span>
              <span className="flex items-center gap-2">
                <Tag color="blue">序号 {item.index + 1}</Tag>
                <button
                  type="button"
                  className="text-xs text-[var(--tiger-text-muted,#6b7280)]"
                  disabled={index === 0}
                  onClick={() => moveBy(index, -1)}>
                  上移
                </button>
                <button
                  type="button"
                  className="text-xs text-[var(--tiger-text-muted,#6b7280)]"
                  disabled={index === items.length - 1}
                  onClick={() => moveBy(index, 1)}>
                  下移
                </button>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-sm text-[var(--tiger-text-muted,#6b7280)]">
        指针拖拽重排（须包一层 drop zone）。键盘请用上移 / 下移。当前拖拽：
        <strong>{draggedTitle}</strong>
      </p>
    </>
  )
}
