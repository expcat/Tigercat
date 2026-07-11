import { useState } from 'react'
import { DataExport } from '@expcat/tigercat-react/DataExport'
import type { TableColumn } from '@expcat/tigercat-react'
import type { DataExportFormat } from '@expcat/tigercat-core'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: 'active' | 'disabled'
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', status: 'active' },
  { id: 2, name: '李娜', status: 'disabled' }
]

export default function App() {
  const [lastExport, setLastExport] = useState('')

  return (
    <div className="flex items-center gap-3">
      <DataExport<Row>
        columns={columns}
        dataSource={rows}
        fileName="员工名单"
        sheetName="员工"
        cellFormatter={(value, column) =>
          column.key === 'status' ? (value === 'active' ? '在职' : '离职') : value
        }
        onExport={(format: DataExportFormat) => setLastExport(format)}
      />
      {lastExport && <span className="text-sm text-gray-500">最近导出：{lastExport}</span>}
    </div>
  )
}
