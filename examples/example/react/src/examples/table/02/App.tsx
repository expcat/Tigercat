import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  age: number
  status: 'active' | 'inactive'
}

const columns: TableColumn<Row>[] = [
  {
    key: 'name',
    title: '姓名',
    sortable: true,
    filter: { type: 'text', placeholder: '搜索姓名...' }
  },
  { key: 'age', title: '年龄', sortable: true, width: 100 },
  {
    key: 'status',
    title: '状态',
    filter: {
      type: 'select',
      options: [
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '停用' }
      ]
    }
  }
]

const rows: Row[] = [
  { id: 1, name: '张伟', age: 32, status: 'active' },
  { id: 2, name: '李娜', age: 28, status: 'inactive' },
  { id: 3, name: '王强', age: 41, status: 'active' }
]

export default function App() {
  return <Table<Row> columns={columns} dataSource={rows} pagination={false} />
}
