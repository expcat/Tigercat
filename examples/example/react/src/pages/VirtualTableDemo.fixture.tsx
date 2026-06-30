import { useMemo } from 'react'
import { VirtualTable } from '@expcat/tigercat-react/VirtualTable'
import { type TableColumn } from '@expcat/tigercat-react'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

export default function VirtualTableDemoFixture() {
  const data = useMemo(
    () =>
      Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `用户 ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '忙碌'
      })),
    []
  )

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <VirtualTable
          dataSource={data}
          columns={columns}
          virtualHeight={400}
          virtualItemHeight={48}
        />
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">加载 & 空状态</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <VirtualTable dataSource={[]} columns={columns} virtualHeight={200} loading />
          <VirtualTable
            dataSource={[]}
            columns={columns}
            virtualHeight={200}
            emptyText="暂无数据"
          />
        </div>
      </section>
    </div>
  )
}
