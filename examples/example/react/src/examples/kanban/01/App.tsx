import { useState } from 'react'
import { Kanban } from '@expcat/tigercat-react/Kanban'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

const initialColumns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计界面' },
      { id: '2', title: '补充文档' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: '3', title: '实现看板' }]
  },
  { id: 'done', title: '已完成', cards: [] }
]

export default function App() {
  const [columns, setColumns] = useState(initialColumns)

  return (
    <Kanban
      columns={columns}
      onColumnsChange={setColumns}
      allowAddCard
      enforceWipLimit
      showCardCount
      style={{ height: 400 }}
    />
  )
}
