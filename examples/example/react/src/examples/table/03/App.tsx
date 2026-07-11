import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: 'active' | 'inactive'
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  {
    key: 'status',
    title: '状态',
    render: (record) => (
      <span
        className={
          record.status === 'active'
            ? 'rounded bg-green-50 px-2 py-1 text-green-700'
            : 'rounded bg-gray-100 px-2 py-1 text-gray-600'
        }>
        {record.status === 'active' ? '启用' : '停用'}
      </span>
    )
  }
]

const rows: Row[] = [
  { id: 1, name: '张伟', status: 'active' },
  { id: 2, name: '李娜', status: 'inactive' }
]

export default function App() {
  return <Table<Row> columns={columns} dataSource={rows} pagination={false} />
}
