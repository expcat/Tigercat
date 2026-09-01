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
      pagination={false}
      rowSelection={{ type: 'checkbox' }}
      toolbar={{
        searchPlaceholder: '搜索',
        showColumnSettings: true,
        filtersExtra: ({ dataSource, selectedKeys, hiddenColumnKeys }) => {
          const selected = selectedKeys.length
            ? (dataSource as Row[]).filter((row) => selectedKeys.includes(row.id))
            : (dataSource as Row[])
          return (
            <DataExport<Row>
              columns={columns}
              dataSource={selected}
              hiddenColumnKeys={hiddenColumnKeys}
              fileName="成员列表"
            />
          )
        }
      }}
    />
  )
}
