import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  email: string
  role: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名', width: 160, fixed: 'left', hideable: false },
  { key: 'email', title: '邮箱', width: 220 },
  { key: 'role', title: '角色', width: 140 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', email: 'zhang@example.com', role: '管理员' },
  { id: 2, name: '李娜', email: 'li@example.com', role: '编辑' }
]

export default function App() {
  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={rows}
      columnLockable
      defaultHiddenColumnKeys={['email']}
      toolbar={{
        showColumnSettings: true,
        columnSettings: { lockedColumnKeys: ['name'] }
      }}
      pagination={false}
    />
  )
}
