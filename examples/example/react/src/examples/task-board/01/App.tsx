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
  },
  { id: 'done', title: '已完成', cards: [] }
]

export default function App() {
  const [columns, setColumns] = useState(initialColumns)

  return (
    <TaskBoard
      columns={columns}
      onColumnsChange={setColumns}
      allowAddCard
      enforceWipLimit
      showCardCount
    />
  )
}
