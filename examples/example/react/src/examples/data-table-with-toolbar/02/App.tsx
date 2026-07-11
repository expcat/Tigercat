import { useMemo, useState } from 'react'
import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import type { TableColumn, TableToolbarFilterValue } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  score: number
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '成员' },
  { key: 'score', title: '积分', width: 100 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', score: 92 },
  { id: 2, name: '李娜', score: 78 },
  { id: 3, name: '王强', score: 65 }
]

export default function App() {
  const [filters, setFilters] = useState<Record<string, TableToolbarFilterValue>>({
    minimumScore: null
  })
  const minimumScore = typeof filters.minimumScore === 'number' ? filters.minimumScore : 0
  const dataSource = useMemo(() => rows.filter((row) => row.score >= minimumScore), [minimumScore])

  return (
    <DataTableWithToolbar<Row>
      columns={columns}
      dataSource={dataSource}
      toolbar={{
        filters: [
          {
            key: 'minimumScore',
            label: '最低积分',
            render: ({ value, setValue }) => (
              <input
                type="number"
                aria-label="最低积分"
                className="w-28 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600"
                value={typeof value === 'number' ? value : ''}
                placeholder="最低积分"
                onChange={(event) =>
                  setValue(event.currentTarget.value ? Number(event.currentTarget.value) : null)
                }
              />
            )
          }
        ],
        onFiltersChange: setFilters
      }}
      pagination={false}
    />
  )
}
