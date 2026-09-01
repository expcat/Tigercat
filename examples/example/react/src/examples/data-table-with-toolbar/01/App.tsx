import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  team: string
  status: 'active' | 'paused'
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名', width: 140 },
  { key: 'team', title: '团队' },
  { key: 'status', title: '状态', width: 100 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', team: '产品', status: 'active' },
  { id: 2, name: '李娜', team: '设计', status: 'paused' },
  { id: 3, name: '王强', team: '研发', status: 'active' }
]

const statusOptions = [
  { label: '在岗', value: 'active' },
  { label: '暂停', value: 'paused' }
]

export default function App() {
  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={rows}
      bordered
      tableLayout="fixed"
      rowSelection={{ type: 'checkbox' }}
      toolbar={{
        searchPlaceholder: '搜索姓名',
        filters: [{ key: 'status', label: '状态', options: statusOptions }],
        bulkActions: [{ key: 'export', label: '导出' }]
      }}
    />
  )
}
