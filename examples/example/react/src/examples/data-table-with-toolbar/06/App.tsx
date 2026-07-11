import { DataExport } from '@expcat/tigercat-react/DataExport'
import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', status: '在岗' },
  { id: 2, name: '李娜', status: '休假' }
]

export default function App() {
  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={rows}
      toolbar={{
        filtersExtra: <DataExport<Row> columns={columns} dataSource={rows} fileName="成员列表" />
      }}
      pagination={false}
    />
  )
}
