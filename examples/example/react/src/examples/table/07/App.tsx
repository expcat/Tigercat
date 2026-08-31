import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-react'

interface Row extends Record<string, unknown> {
  id: number
  name: string
}

type DemoState = 'data' | 'loading' | 'empty'

const columns: TableColumn<Row>[] = [{ key: 'name', title: '姓名' }]
const rows: Row[] = [{ id: 1, name: '张伟' }]

export default function App() {
  const [state, setState] = useState<DemoState>('data')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={state === 'data' ? 'primary' : 'secondary'}
          onClick={() => setState('data')}>
          有数据
        </Button>
        <Button
          size="sm"
          variant={state === 'loading' ? 'primary' : 'secondary'}
          onClick={() => setState('loading')}>
          加载中
        </Button>
        <Button
          size="sm"
          variant={state === 'empty' ? 'primary' : 'secondary'}
          onClick={() => setState('empty')}>
          空状态
        </Button>
      </div>
      <Table<Row>
        columns={columns}
        dataSource={state === 'empty' ? [] : rows}
        loading={state === 'loading'}
        emptyText="暂无成员"
        pagination={false}
      />
    </div>
  )
}
