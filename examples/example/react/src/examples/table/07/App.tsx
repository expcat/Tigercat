import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

const columns: TableColumn<Row>[] = [{ key: 'name', title: '姓名' }]
const rows: Row[] = [{ id: 1, name: '张伟' }]

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setLoading((value) => !value)}>
        切换为{loading ? '空状态' : '加载状态'}
      </Button>
      <Table<Row>
        columns={columns}
        dataSource={loading ? rows : []}
        loading={loading}
        emptyText="暂无成员"
        pagination={false}
      />
    </div>
  )
}
