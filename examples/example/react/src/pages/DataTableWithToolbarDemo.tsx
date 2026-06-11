import React, { useMemo, useState, useEffect } from 'react'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-react'
import type { TableCardLayoutItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'


interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
  email: string
}

const basicSnippet = `<DataTableWithToolbar
  columns={columns}
  dataSource={pagedData}
  rowSelection={{ selectedRowKeys, type: 'checkbox' }}
  toolbar={{
    searchValue: keyword,
    searchPlaceholder: '搜索姓名/邮箱',
    filters: [
      { key: 'status', label: '状态', options: statusOptions },
      { key: 'role', label: '角色', options: roleOptions }
    ],
    bulkActions: [
      { key: 'export', label: '导出' },
      { key: 'delete', label: '删除', variant: 'outline' }
    ],
    selectedKeys: selectedRowKeys
  }}
  pagination={{
    current, pageSize,
    total: filteredData.length,
    showSizeChanger: true,
    showTotal: true
  }}
  onSearchChange={setKeyword}
  onFiltersChange={setFilters}
  onBulkAction={handleBulkAction}
  onPageChange={handlePageChange}
  onSelectionChange={setSelectedRowKeys}
/>`

const basicScriptSnippet = `const [keyword, setKeyword] = useState('')
const [filters, setFilters] = useState<Record<string, TableToolbarFilterValue>>({
  status: null,
  role: null
})
const [pagination, setPagination] = useState({ current: 1, pageSize: 6 })
const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])`

const columns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名', width: '25%' },
  { key: 'email', title: '邮箱', width: '35%' },
  { key: 'role', title: '角色', width: '20%' },
  { key: 'status', title: '状态', width: '20%' }
]

// Card-mode customization: promote 名称 to the card heading, hide secondary
// fields (ID), and order the remaining fields with cardPriority.
const cardColumns: TableColumn<UserRow>[] = [
  { key: 'id', title: 'ID', width: '10%', hideInCard: true },
  { key: 'name', title: '姓名', width: '25%', cardTitle: true },
  { key: 'status', title: '状态', width: '20%', cardPriority: 1 },
  { key: 'role', title: '角色', width: '20%', cardPriority: 2 },
  { key: 'email', title: '邮箱', width: '25%' }
]

const cardSnippet = `// Card-mode field customization (activates below cardBreakpoint)
const cardColumns: TableColumn<UserRow>[] = [
  { key: 'id', title: 'ID', hideInCard: true },          // hidden in cards
  { key: 'name', title: '姓名', cardTitle: true },        // card heading
  { key: 'status', title: '状态', cardPriority: 1 },      // first body field
  { key: 'role', title: '角色', cardPriority: 2 },
  { key: 'email', title: '邮箱' }
]

<DataTableWithToolbar
  columns={cardColumns}
  dataSource={pagedData}
  responsiveMode="card"
  cardBreakpoint="lg"
  /* ...toolbar / pagination as above... */
/>`

const gridCardColumns: TableColumn<UserRow>[] = [
  { key: 'id', title: 'ID', width: '10%', hideInCard: true },
  {
    key: 'name',
    title: '姓名',
    width: '25%',
    cardTitle: true
  },
  {
    key: 'email',
    title: '邮箱',
    width: '35%',
    cardGrid: { colSpan: 6, labelPosition: 'top' }
  },
  {
    key: 'role',
    title: '角色',
    width: '20%',
    cardGrid: { colSpan: 6, labelPosition: 'top' }
  },
  {
    key: 'status',
    title: '状态',
    width: '20%',
    cardGrid: { colSpan: 4, labelPosition: 'top' }
  }
]

const gridCardLayout: TableCardLayoutItem[] = [
  { key: 'email', colSpan: 6, labelPosition: 'top' },
  { key: 'role', colSpan: 3, labelPosition: 'top' },
  { key: 'status', colSpan: 3, labelPosition: 'top' }
]

const gridCardSnippet = `// 自定义卡片网格布局 — 使用 cardGrid 列属性或 cardLayout 集中配置
const gridCardColumns: TableColumn<UserRow>[] = [
  { key: 'id', title: 'ID', hideInCard: true },
  { key: 'name', title: '姓名', cardTitle: true },
  { key: 'email', title: '邮箱', cardGrid: { colSpan: 6, labelPosition: 'top' } },
  { key: 'role', title: '角色', cardGrid: { colSpan: 6, labelPosition: 'top' } },
  { key: 'status', title: '状态', cardGrid: { colSpan: 4, labelPosition: 'top' } }
]

// 或使用 cardLayout 集中定义（覆盖 cardGrid）
const gridCardLayout: TableCardLayoutItem[] = [
  { key: 'email', colSpan: 6, labelPosition: 'top' },
  { key: 'role', colSpan: 3, labelPosition: 'top' },
  { key: 'status', colSpan: 3, labelPosition: 'top' }
]

<DataTableWithToolbar
  columns={gridCardColumns}
  dataSource={pagedData}
  responsiveMode="card"
  cardBreakpoint="lg"
  cardLayout={gridCardLayout}
/>`

const columnSettingsSnippet = `// 工具栏列设置：内置 Popover + Checkbox 面板，驱动 Table 的 hiddenColumnKeys
const settingsColumns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名', hideable: false },  // 不可隐藏
  { key: 'email', title: '邮箱' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
]

<DataTableWithToolbar
  columns={settingsColumns}
  dataSource={pagedData}
  toolbar={{ showColumnSettings: true }}
  defaultHiddenColumnKeys={['role']}
  onHiddenColumnsChange={(keys) => console.log('hidden:', keys)}
/>

// 受控模式：传 hiddenColumnKeys（配合 onHiddenColumnsChange 更新状态）
// 锁定特定列：toolbar={{ showColumnSettings: true, columnSettings: { lockedColumnKeys: ['name'] } }}`

const settingsColumns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名', width: '25%', hideable: false },
  { key: 'email', title: '邮箱', width: '35%' },
  { key: 'role', title: '角色', width: '20%' },
  { key: 'status', title: '状态', width: '20%' }
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' }
]

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '访客', value: 'viewer' }
]

const seedData: UserRow[] = Array.from({ length: 26 }).map((_, index) => {
  const role: UserRow['role'] = index % 3 === 0 ? 'admin' : index % 3 === 1 ? 'editor' : 'viewer'
  const status: UserRow['status'] = index % 4 === 0 ? 'disabled' : 'active'
  return {
    id: index + 1,
    name: `用户 ${index + 1}`,
    role,
    status,
    email: `user${index + 1}@example.com`
  }
})

const DataTableWithToolbarDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<Record<string, TableToolbarFilterValue>>({
    status: null,
    role: null
  })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 6 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [keyword, filters.status, filters.role])

  const filteredData = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase()
    return seedData.filter((item) => {
      const matchKeyword =
        !lowerKeyword ||
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.email.toLowerCase().includes(lowerKeyword)
      const matchStatus = !filters.status || item.status === filters.status
      const matchRole = !filters.role || item.role === filters.role
      return matchKeyword && matchStatus && matchRole
    })
  }, [keyword, filters])

  const pagedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredData.slice(start, end)
  }, [filteredData, pagination])

  const handlePageChange = (current: number, pageSize: number) => {
    setPagination({ current, pageSize })
  }

  const handleFiltersChange = (nextFilters: Record<string, TableToolbarFilterValue>) => {
    setFilters(nextFilters)
  }

  const handleBulkAction = (action: { key: string | number }) => {
    const actionKey = String(action.key)
    if (selectedRowKeys.length === 0) return
    alert(`执行批量操作: ${actionKey}，选中 ${selectedRowKeys.length} 项`) // demo only
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DataTableWithToolbar 表格工具栏</h1>
        <p className="text-gray-600 dark:text-gray-400">
          搜索、筛选、批量操作与分页联动的组合组件。
        </p>
      </div>

      <DemoBlock
        title="基础用法"
        description="搜索/筛选/批量操作 + 分页联动"
        code={basicSnippet}
        script={basicScriptSnippet}>
        <DataTableWithToolbar<UserRow>
          columns={columns}
          dataSource={pagedData}
          tableLayout="fixed"
          rowSelection={{
            selectedRowKeys,
            type: 'checkbox'
          }}
          toolbar={{
            searchValue: keyword,
            searchPlaceholder: '搜索姓名/邮箱',
            filters: [
              { key: 'status', label: '状态', options: statusOptions },
              { key: 'role', label: '角色', options: roleOptions }
            ],
            bulkActions: [
              {
                key: 'export',
                label: '导出'
              },
              {
                key: 'delete',
                label: '删除',
                variant: 'outline'
              }
            ],
            selectedKeys: selectedRowKeys
          }}
          onSearchChange={setKeyword}
          onSearch={setKeyword}
          onFiltersChange={handleFiltersChange}
          onBulkAction={handleBulkAction}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showTotal: true
          }}
          onSelectionChange={setSelectedRowKeys}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageChange}
        />
      </DemoBlock>

      <DemoBlock
        title="列设置"
        description="开启 showColumnSettings 后，工具栏右侧出现列设置入口，可勾选控制列显隐;hideable: false 的列不可隐藏。支持受控（hiddenColumnKeys）与非受控（defaultHiddenColumnKeys）两种模式。"
        code={columnSettingsSnippet}>
        <DataTableWithToolbar<UserRow>
          columns={settingsColumns}
          dataSource={pagedData}
          tableLayout="fixed"
          toolbar={{ showColumnSettings: true }}
          defaultHiddenColumnKeys={['role']}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showTotal: true
          }}
          onPageChange={handlePageChange}
        />
      </DemoBlock>

      <DemoBlock
        title="卡片模式字段定制"
        description="窄屏（小于 cardBreakpoint，此处为 lg/1024px）自动切换为卡片：name 作为标题、id 隐藏、status/role 按 cardPriority 排序。缩窄窗口可预览。"
        code={cardSnippet}>
        <DataTableWithToolbar<UserRow>
          columns={cardColumns}
          dataSource={pagedData}
          responsiveMode="card"
          cardBreakpoint="lg"
          toolbar={{
            searchValue: keyword,
            searchPlaceholder: '搜索姓名/邮箱',
            filters: [
              { key: 'status', label: '状态', options: statusOptions },
              { key: 'role', label: '角色', options: roleOptions }
            ]
          }}
          onSearchChange={setKeyword}
          onSearch={setKeyword}
          onFiltersChange={handleFiltersChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showTotal: true
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageChange}
        />
      </DemoBlock>

      <DemoBlock
        title="自定义卡片网格布局"
        description="使用 cardGrid 列属性或 cardLayout 集中配置，实现双列/三列混排的卡片网格布局。cardLayout 配置优先于 cardGrid；最窄屏默认单列，sm 及以上按 colSpan 混排。缩窄窗口到 lg/1024px 以下可预览效果。"
        code={gridCardSnippet}>
        <DataTableWithToolbar<UserRow>
          columns={gridCardColumns}
          dataSource={pagedData}
          responsiveMode="card"
          cardBreakpoint="lg"
          cardLayout={gridCardLayout}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showTotal: true
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageChange}
        />
      </DemoBlock>
    </div>
  )
}

export default DataTableWithToolbarDemo
