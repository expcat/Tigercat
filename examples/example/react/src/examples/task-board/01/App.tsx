import { useState } from 'react'
import { TaskBoard } from '@expcat/tigercat-react/TaskBoard'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

const initialColumns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: 1, title: '整理示例' },
      { id: 2, title: '补充说明' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: 3, title: '运行验证' }]
  }
]

export default function App() {
  const [columns, setColumns] = useState(initialColumns)

  const handleCardAdd = (columnId: string | number) => {
    setColumns((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [...column.cards, { id: Date.now(), title: '新任务' }]
            }
          : column
      )
    )
  }

  return (
    <TaskBoard
      columns={columns}
      onColumnsChange={setColumns}
      onCardAdd={handleCardAdd}
      allowAddCard
      enforceWipLimit
      labels={{ addCardText: '新增任务' }}
    />
  )
}
