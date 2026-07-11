import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  team: string
  status: string
}

const columns: TableColumn<Row>[] = [
  { key: 'id', title: 'ID', width: 72, hideInCard: true },
  { key: 'name', title: '姓名', cardTitle: true },
  { key: 'status', title: '状态', cardPriority: 1 },
  { key: 'team', title: '团队', cardPriority: 2 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', team: '产品', status: '在岗' },
  { id: 2, name: '李娜', team: '设计', status: '休假' }
]

export default function App() {
  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={rows}
      responsiveMode="card"
      cardBreakpoint="lg"
      pagination={false}
    />
  )
}
