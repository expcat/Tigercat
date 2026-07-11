import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  role: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名', width: 160 },
  { key: 'role', title: '角色' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', role: '产品经理' },
  { id: 2, name: '李娜', role: '前端工程师' },
  { id: 3, name: '王强', role: '设计师' }
]

export default function App() {
  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      bordered
      striped
      size="sm"
      tableLayout="fixed"
      pagination={false}
    />
  )
}
