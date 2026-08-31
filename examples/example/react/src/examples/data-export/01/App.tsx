import { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { DataExport } from '@expcat/tigercat-react/DataExport'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TableColumn } from '@expcat/tigercat-react'
import type { DataExportFormat } from '@expcat/tigercat-core'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  hiredAt: Date
  secret: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'hiredAt', title: '到職日', dataKey: 'hiredAt' },
  { key: 'secret', title: '內部備註' },
  { key: 'actions', title: '操作', render: () => '編輯' }
]

const rows: Row[] = [
  { id: 1, name: '張偉', hiredAt: new Date('2024-03-01T00:00:00.000Z'), secret: 'hidden' },
  { id: 2, name: '李娜', hiredAt: new Date('2025-08-12T00:00:00.000Z'), secret: 'hidden' }
]

export default function App() {
  const [lastExport, setLastExport] = useState('')
  const [error, setError] = useState('')

  const onExport = (format: DataExportFormat) => {
    setError('')
    setLastExport(format)
  }

  return (
    <ConfigProvider locale={zhTW}>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-sm text-gray-500">
            預設 formats 是 Excel + Markdown 下拉。操作列沒有
            dataKey，不會寫進檔案；hiddenColumnKeys 會跳過內部備註。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <DataExport<Row>
              columns={columns}
              dataSource={rows}
              fileName="report.xlsx"
              sheetName="員工"
              hiddenColumnKeys={['secret']}
              onExport={onExport}
              onError={() => setError('failed')}
            />
            {lastExport && <span className="text-sm text-gray-500">最近匯出：{lastExport}</span>}
            {error && (
              <span className="text-sm text-red-600" role="status">
                {error}
              </span>
            )}
          </div>
        </section>
        <section className="space-y-2">
          <p className="text-sm text-gray-500">單一格式是一顆按鈕；disabled 不會觸發下載。</p>
          <div className="flex flex-wrap items-center gap-3">
            <DataExport<Row>
              columns={columns}
              dataSource={rows}
              formats={['xlsx']}
              fileName="report.xlsx"
              hiddenColumnKeys={['secret']}
              onExport={onExport}
            />
            <DataExport<Row>
              columns={columns}
              dataSource={rows}
              formats={['csv']}
              fileName="report.csv"
              hiddenColumnKeys={['secret']}
              disabled
            />
          </div>
        </section>
      </div>
    </ConfigProvider>
  )
}
