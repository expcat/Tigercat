import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  email: string
  city: string
  status: string
}

const columns: TableColumn<Row>[] = [
  {
    key: 'name',
    title: '姓名',
    width: 160,
    fixed: 'left',
    fixedHeaderClassName: 'shadow-[inset_-1px_0_0_var(--tiger-border)]',
    fixedClassName: 'shadow-[inset_-1px_0_0_var(--tiger-border)]'
  },
  { key: 'email', title: '邮箱', width: 240 },
  { key: 'city', title: '城市', width: 180 },
  { key: 'status', title: '状态', width: 140, fixed: 'right' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', email: 'zhang@example.com', city: '上海', status: '在线' },
  { id: 2, name: '李娜', email: 'li@example.com', city: '北京', status: '离线' },
  { id: 3, name: '王强', email: 'wang@example.com', city: '深圳', status: '在线' }
]

export default function App() {
  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      columnLockable
      stickyHeader
      maxHeight={220}
      striped
      pagination={false}
    />
  )
}
