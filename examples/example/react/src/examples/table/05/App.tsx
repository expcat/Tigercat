import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: string
  email: string
}

const columns: TableColumn<Row>[] = [
  { key: 'id', title: 'ID', hideInCard: true },
  { key: 'name', title: '姓名', cardTitle: true },
  { key: 'status', title: '状态', cardPriority: 1 },
  { key: 'email', title: '邮箱', cardPriority: 2 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', status: '在线', email: 'zhang@example.com' },
  { id: 2, name: '李娜', status: '离线', email: 'li@example.com' }
]

export default function App() {
  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      responsiveMode="card"
      cardBreakpoint="lg"
      cardFieldGap="gap-2"
      pagination={false}
    />
  )
}
