import { useState } from 'react'
import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  role: string
  detail: string
}

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', role: '产品经理', detail: '负责需求规划与团队协作。' },
  { id: 2, name: '李娜', role: '前端工程师', detail: '负责 Web 端体验与组件建设。' }
]

export default function App() {
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>([1])

  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      expandable={{
        expandedRowKeys,
        expandedRowRender: (record) => <div className="p-3 text-sm">{record.detail}</div>,
        expandRowByClick: true
      }}
      onExpandChange={setExpandedRowKeys}
      pagination={false}
    />
  )
}
