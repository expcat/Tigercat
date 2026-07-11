import { useMemo, useState } from 'react'
import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  role: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', role: '管理员' },
  { id: 2, name: '李娜', role: '编辑' },
  { id: 3, name: '王强', role: '访客' }
]

export default function App() {
  const [keyword, setKeyword] = useState('')
  const dataSource = useMemo(
    () => rows.filter((row) => row.name.includes(keyword.trim())),
    [keyword]
  )

  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={dataSource}
      toolbar={{
        searchValue: keyword,
        onSearchChange: setKeyword,
        render: ({ searchValue, setSearch }) => (
          <div
            role="toolbar"
            aria-label="成员筛选"
            className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
            <input
              className="min-w-0 flex-1 rounded border border-blue-200 bg-white px-3 py-1.5 text-sm dark:border-blue-800 dark:bg-gray-900"
              value={searchValue}
              placeholder="筛选成员"
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
              onClick={() => setSearch('')}>
              清空
            </button>
          </div>
        )
      }}
      pagination={false}
    />
  )
}
