import React, { useMemo, useState, useEffect } from 'react'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-react'
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
    onSearchChange: setKeyword,
    filters: [
      { key: 'status', label: '状态', options: statusOptions },
      { key: 'role', label: '角色', options: roleOptions }
    ],
    onFiltersChange: setFilters,
    bulkActions: [{ key: 'export', label: '导出' }],
    selectedKeys: selectedRowKeys
  }}
  pagination={{ current, pageSize, total, showSizeChanger: true, showTotal: true }}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageChange}
/>`

const columns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
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
  }, [keyword, filters, seedData])

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

  const handleBulkAction = (actionKey: string) => {
    if (selectedRowKeys.length === 0) return
    alert(`执行批量操作: ${actionKey}，选中 ${selectedRowKeys.length} 项`) // demo only
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DataTableWithToolbar 表格工具栏</h1>
        <p className="text-gray-600">搜索、筛选、批量操作与分页联动的组合组件。</p>
      </div>

      <DemoBlock title="基础用法" description="搜索/筛选/批量操作 + 分页联动" code={basicSnippet}>
        <DataTableWithToolbar<UserRow>
          columns={columns}
          dataSource={pagedData}
          rowSelection={{
            selectedRowKeys,
            type: 'checkbox'
          }}
          toolbar={{
            searchValue: keyword,
            searchPlaceholder: '搜索姓名/邮箱',
            onSearchChange: setKeyword,
            onSearch: setKeyword,
            filters: [
              { key: 'status', label: '状态', options: statusOptions },
              { key: 'role', label: '角色', options: roleOptions }
            ],
            onFiltersChange: handleFiltersChange,
            bulkActions: [
              {
                key: 'export',
                label: '导出',
                onClick: () => handleBulkAction('export')
              },
              {
                key: 'delete',
                label: '删除',
                variant: 'outline',
                onClick: () => handleBulkAction('delete')
              }
            ],
            selectedKeys: selectedRowKeys
          }}
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
    </div>
  )
}

export default DataTableWithToolbarDemo
