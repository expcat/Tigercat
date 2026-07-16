import { useState } from 'react'
import { VirtualTable } from '@expcat/tigercat-react/VirtualTable'
import type { TableColumn } from '@expcat/tigercat-core'

type TableView = 'data' | 'loading' | 'empty'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 90 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'team', title: '团队', width: 140 },
  { key: 'role', title: '岗位', width: 160 },
  { key: 'region', title: '区域', width: 120 },
  { key: 'level', title: '职级', width: 100 },
  { key: 'project', title: '当前项目', width: 180 },
  { key: 'utilization', title: '投入率', width: 110 },
  { key: 'status', title: '状态', width: 110 },
  { key: 'manager', title: '直属主管', width: 140 },
  { key: 'startDate', title: '加入日期', width: 130 },
  { key: 'skills', title: '技能方向', width: 180 }
]

const teams = ['平台', '增长', '设计', '数据']
const roles = ['前端工程师', '后端工程师', '产品经理', '设计师']
const rows = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  name: `成员 ${String(index + 1).padStart(3, '0')}`,
  team: teams[index % teams.length],
  role: roles[index % roles.length],
  region: ['上海', '北京', '深圳'][index % 3],
  level: `P${(index % 5) + 4}`,
  project: `项目 ${(index % 8) + 1}`,
  utilization: `${60 + (index % 36)}%`,
  status: index % 4 === 0 ? '休假' : '在岗',
  manager: `主管 ${(index % 12) + 1}`,
  startDate: `202${index % 6}-${String((index % 12) + 1).padStart(2, '0')}-15`,
  skills: ['Web', '服务端', '体验设计', '数据分析'][index % 4]
}))

const viewOptions: Array<{ value: TableView; label: string }> = [
  { value: 'data', label: '数据' },
  { value: 'loading', label: '加载状态' },
  { value: 'empty', label: '空状态' }
]

export default function App() {
  const [view, setView] = useState<TableView>('data')
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([2, 4])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="虚拟表格展示状态">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              view === option.value
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
            aria-pressed={view === option.value}
            onClick={() => setView(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500" aria-live="polite">
        已选择 {selectedKeys.length} 行；横向滚动时只渲染可见列。
      </p>
      <VirtualTable
        columns={columns}
        dataSource={view === 'data' ? rows : []}
        rowKey="id"
        width={680}
        virtualHeight={360}
        virtualItemHeight={44}
        virtualizeColumns
        loading={view === 'loading'}
        emptyText="当前没有成员数据"
        bordered
        striped
        rowSelection={{
          selectedRowKeys: selectedKeys,
          getRowKey: (row) => row.id as number
        }}
        onSelectionChange={setSelectedKeys}
      />
    </div>
  )
}
