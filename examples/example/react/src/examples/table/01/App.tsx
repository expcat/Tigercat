import React, { useState } from 'react'
import { Table } from '@expcat/tigercat-react/Table'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { type TableColumn } from '@expcat/tigercat-react'

interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const getStatusText = (status: UserData['status']) => (status === 'active' ? '启用' : '停用')

export default function App() {
  // Basic data
  const [basicData, setBasicData] = useState<UserData[]>([
    {
      id: 1,
      name: 'John Doe',
      age: 28,
      email: 'john@example.com',
      status: 'active',
      address: 'New York'
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      email: 'jane@example.com',
      status: 'inactive',
      address: 'London'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      age: 45,
      email: 'bob@example.com',
      status: 'active',
      address: 'Paris'
    },
    {
      id: 4,
      name: 'Alice Brown',
      age: 29,
      email: 'alice@example.com',
      status: 'active',
      address: 'Tokyo'
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      age: 38,
      email: 'charlie@example.com',
      status: 'inactive',
      address: 'Berlin'
    }
  ])

  // Large dataset for pagination
  const [largeData] = useState<UserData[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 40),
      email: `user${i + 1}@example.com`,
      status: i % 3 === 0 ? 'inactive' : 'active',
      address: ['New York', 'London', 'Paris', 'Tokyo', 'Berlin'][i % 5]
    }))
  )

  // Controlled pagination state
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const pagedData = largeData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )

  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

  const [lastAction, setLastAction] = useState('尚未执行表格操作')

  // Expandable rows state
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([])

  // Basic columns
  const basicColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', width: 150 },
    { key: 'age', title: '年龄', width: 100 },
    { key: 'email', title: '邮箱', width: 200 }
  ]

  const cardColumns: TableColumn<UserData>[] = [
    { key: 'id', title: 'ID', hideInCard: true },
    { key: 'name', title: '姓名', cardTitle: true },
    {
      key: 'status',
      title: '状态',
      cardPriority: 1,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{getStatusText(record.status)}</span>
      }
    },
    { key: 'age', title: '年龄', cardPriority: 2 },
    { key: 'email', title: '邮箱' }
  ]

  // Sortable columns
  const sortableColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', sortable: true, width: 150 },
    { key: 'age', title: '年龄', sortable: true, width: 100 },
    { key: 'email', title: '邮箱', width: 200 }
  ]

  // Filterable columns
  const filterableColumns: TableColumn<UserData>[] = [
    {
      key: 'name',
      title: '姓名',
      sortable: true,
      filter: { type: 'text', placeholder: '搜索姓名...' },
      width: 150
    },
    {
      key: 'age',
      title: '年龄',
      sortable: true,
      width: 100
    },
    {
      key: 'status',
      title: '状态',
      filter: {
        type: 'select',
        options: [
          { value: 'active', label: '启用' },
          { value: 'inactive', label: '停用' }
        ]
      },
      width: 120
    },
    { key: 'email', title: '邮箱', width: 200 }
  ]

  // Custom render columns
  const customColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', width: 150 },
    { key: 'age', title: '年龄', width: 100 },
    {
      key: 'status',
      title: '状态',
      width: 120,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{getStatusText(record.status)}</span>
      }
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 150,
      render: (record: UserData) => (
        <Space>
          <Button size="sm" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  // Fixed columns (sticky left/right)
  const fixedColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', width: 160, fixed: 'left' },
    { key: 'age', title: '年龄', width: 120 },
    { key: 'email', title: '邮箱', width: 240 },
    { key: 'address', title: '地址', width: 160 },
    {
      key: 'status',
      title: '状态',
      width: 140,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{getStatusText(record.status)}</span>
      }
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 180,
      fixed: 'right',
      render: (record: UserData) => (
        <Space>
          <Button size="sm" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const styledFixedColumns: TableColumn<UserData>[] = [
    {
      key: 'name',
      title: '姓名',
      width: 180,
      fixed: 'left',
      fixedHeaderClassName:
        'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
      fixedClassName: ({ selected }) =>
        selected
          ? 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
          : 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)]'
    },
    { key: 'age', title: '年龄', width: 120 },
    { key: 'email', title: '邮箱', width: 240 },
    { key: 'address', title: '地址', width: 180 },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 180,
      fixed: 'right',
      fixedHeaderClassName:
        'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
      fixedClassName: ({ selected }) =>
        selected
          ? 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
          : 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)]',
      render: (record: UserData) => (
        <Space>
          <Button size="sm" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  // Fixed action column with inline dropdown menus (portaled to body)
  const fixedDropdownColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', width: 160, fixed: 'left' },
    { key: 'age', title: '年龄', width: 120 },
    { key: 'email', title: '邮箱', width: 240 },
    { key: 'address', title: '地址', width: 200 },
    { key: 'status', title: '状态', width: 140 },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (record: UserData) => (
        <Dropdown trigger="click" showArrow={false}>
          <Button size="sm" variant="outline">
            操作
          </Button>
          <DropdownMenu>
            <DropdownItem onClick={() => handleEdit(record)}>编辑</DropdownItem>
            <DropdownItem onClick={() => handleDelete(record)}>删除</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
    }
  ]

  // Lockable columns (toggle fixed via header lock button)
  const lockableColumns: TableColumn<UserData>[] = [
    { key: 'name', title: '姓名', width: 160 },
    { key: 'age', title: '年龄', width: 120 },
    { key: 'email', title: '邮箱', width: 260 },
    { key: 'address', title: '地址', width: 200 },
    { key: 'status', title: '状态', width: 160 },
    { key: 'actions', title: '操作', width: 200, align: 'center' }
  ]

  const handleEdit = (record: UserData) => {
    setLastAction(`正在编辑：${record.name}`)
  }

  const handleDelete = (record: UserData) => {
    if (window.confirm(`确认删除 ${record.name}？`)) {
      setBasicData((prev) => prev.filter((item) => item.id !== record.id))
      setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id))
      setLastAction(`已删除：${record.name}`)
    }
  }

  const handleSelectionChange = (keys: (string | number)[]) => {
    setSelectedRowKeys(keys)
  }

  return (
    <>
      <Table<UserData> columns={basicColumns} dataSource={basicData} pagination={false} />
    </>
  )
}
