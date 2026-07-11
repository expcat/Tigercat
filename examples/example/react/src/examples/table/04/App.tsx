import { useState } from 'react'
import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  department: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'department', title: '部门' }
]

const rows: Row[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: '成员 ' + (index + 1),
  department: index % 2 === 0 ? '研发部' : '产品部'
}))

export default function App() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
  const [page, setPage] = useState({ current: 1, pageSize: 5 })

  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      rowSelection={{ selectedRowKeys }}
      pagination={{ ...page, total: rows.length, showSizeChanger: false }}
      onSelectionChange={setSelectedRowKeys}
      onPageChange={setPage}
    />
  )
}
