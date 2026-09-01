import { useState } from 'react'
import { Kanban } from '@expcat/tigercat-react/Kanban'
import type { TaskBoardColumn, TaskBoardSwimlane } from '@expcat/tigercat-core'

const swimlanes: TaskBoardSwimlane[] = [
  { id: 'feature', label: '功能', color: '#2563eb' },
  { id: 'bug', label: '缺陷', color: '#ef4444' }
]

const initialColumns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计界面', type: 'feature' },
      { id: '2', title: '补充文档', type: 'feature' },
      { id: '4', title: '登录失败' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: '3', title: '实现看板', type: 'bug' }]
  },
  { id: 'done', title: '已完成', cards: [] }
]

export default function App() {
  const [columns, setColumns] = useState(initialColumns)

  return (
    <Kanban
      columns={columns}
      onColumnsChange={setColumns}
      swimlanes={swimlanes}
      swimlaneField="type"
      enforceWipLimit
      showCardCount
      style={{ height: 400 }}
    />
  )
}
