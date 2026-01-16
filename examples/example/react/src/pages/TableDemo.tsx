import React, { useState } from 'react'
import { Table, Button, Space, type TableColumn } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const basicSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  pagination={false}
/>`

const borderedSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  bordered
  striped
  pagination={false}
/>`

const sortingSnippet = `<Table<UserData>
  columns={sortableColumns}
  dataSource={basicData}
  pagination={false}
/>`

const filterSnippet = `<Table<UserData>
  columns={filterableColumns}
  dataSource={basicData}
  pagination={false}
/>`

const customSnippet = `<Table<UserData>
  columns={customColumns}
  dataSource={basicData}
  pagination={false}
/>`

const paginationSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={largeData}
  pagination={{
    ...pagination,
    total: largeData.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: true
  }}
  onPageChange={setPagination}
/>`

const selectionSnippet = `<div className="mb-4">
  <p className="text-sm text-gray-600">已选择: {selectedRowKeys.join(', ') || '无'}</p>
</div>
<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  rowSelection={{
    selectedRowKeys: selectedRowKeys,
    type: 'checkbox'
  }}
  pagination={false}
  onSelectionChange={handleSelectionChange}
/>`

const stickySnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={largeData}
  stickyHeader
  maxHeight={400}
  pagination={false}
/>`

const fixedSnippet = `<Table<UserData>
  columns={fixedColumns}
  dataSource={basicData}
  pagination={false}
/>`

const lockableSnippet = `<Table<UserData>
  columns={lockableColumns}
  dataSource={basicData}
  pagination={false}
  columnLockable
/>`

const loadingSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  loading
  pagination={false}
/>`

const emptySnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={[]}
  emptyText="暂无数据"
  pagination={false}
/>`

const TableDemo: React.FC = () => {
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

  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

  // Basic columns
  const basicColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 150 },
    { key: 'age', title: 'Age', width: 100 },
    { key: 'email', title: 'Email', width: 200 }
  ]

  // Sortable columns
  const sortableColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', sortable: true, width: 150 },
    { key: 'age', title: 'Age', sortable: true, width: 100 },
    { key: 'email', title: 'Email', width: 200 }
  ]

  // Filterable columns
  const filterableColumns: TableColumn<UserData>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filter: { type: 'text', placeholder: 'Search name...' },
      width: 150
    },
    {
      key: 'age',
      title: 'Age',
      sortable: true,
      width: 100
    },
    {
      key: 'status',
      title: 'Status',
      filter: {
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      },
      width: 120
    },
    { key: 'email', title: 'Email', width: 200 }
  ]

  // Custom render columns
  const customColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 150 },
    { key: 'age', title: 'Age', width: 100 },
    {
      key: 'status',
      title: 'Status',
      width: 120,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{record.status}</span>
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: 150,
      render: (record: UserData) => (
        <Space>
          <Button size="sm" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      )
    }
  ]

  // Fixed columns (sticky left/right)
  const fixedColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 160, fixed: 'left' },
    { key: 'age', title: 'Age', width: 120 },
    { key: 'email', title: 'Email', width: 240 },
    { key: 'address', title: 'Address', width: 160 },
    {
      key: 'status',
      title: 'Status',
      width: 140,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{record.status}</span>
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: 180,
      fixed: 'right',
      render: (record: UserData) => (
        <Space>
          <Button size="sm" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      )
    }
  ]

  // Lockable columns (toggle fixed via header lock button)
  const lockableColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 160 },
    { key: 'age', title: 'Age', width: 120 },
    { key: 'email', title: 'Email', width: 260 },
    { key: 'address', title: 'Address', width: 200 },
    { key: 'status', title: 'Status', width: 160 },
    { key: 'actions', title: 'Actions', width: 200, align: 'center' }
  ]

  const handleEdit = (record: UserData) => {
    alert(`Editing: ${record.name}`)
  }

  const handleDelete = (record: UserData) => {
    if (window.confirm(`Delete ${record.name}?`)) {
      setBasicData((prev) => prev.filter((item) => item.id !== record.id))
      setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id))
    }
  }

  const handleSelectionChange = (keys: (string | number)[]) => {
    setSelectedRowKeys(keys)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Table 表格</h1>
        <p className="text-gray-600">用于展示行列数据的表格组件，支持排序、筛选、分页等功能。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的表格展示用法。" code={basicSnippet}>
        <Table<UserData> columns={basicColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 带边框和条纹 */}
      <DemoBlock title="带边框和条纹" description="显示边框和条纹行。" code={borderedSnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={basicData}
          bordered
          striped
          pagination={false}
        />
      </DemoBlock>

      {/* 排序 */}
      <DemoBlock
        title="排序功能"
        description="点击列头进行排序，支持升序、降序和取消排序。"
        code={sortingSnippet}>
        <Table<UserData> columns={sortableColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 筛选 */}
      <DemoBlock title="筛选功能" description="支持文本筛选和下拉选择筛选。" code={filterSnippet}>
        <Table<UserData> columns={filterableColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 自定义渲染 */}
      <DemoBlock
        title="自定义列渲染"
        description="通过 render 函数自定义单元格内容。"
        code={customSnippet}>
        <Table<UserData> columns={customColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 分页 */}
      <DemoBlock
        title="分页功能"
        description="大数据集的分页展示（受控模式）。"
        code={paginationSnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={largeData}
          pagination={{
            ...pagination,
            total: largeData.length,
            pageSizeOptions: [10, 20, 50],
            showSizeChanger: true,
            showTotal: true
          }}
          onPageChange={setPagination}
        />
      </DemoBlock>

      {/* 行选择 */}
      <DemoBlock title="行选择" description="选择单行或多行数据。" code={selectionSnippet}>
        <div className="mb-4">
          <p className="text-sm text-gray-600">已选择: {selectedRowKeys.join(', ') || '无'}</p>
        </div>
        <Table<UserData>
          columns={basicColumns}
          dataSource={basicData}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            type: 'checkbox'
          }}
          pagination={false}
          onSelectionChange={handleSelectionChange}
        />
      </DemoBlock>

      {/* 固定表头 */}
      <DemoBlock title="固定表头" description="表头固定，内容可滚动。" code={stickySnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={largeData}
          stickyHeader
          maxHeight={400}
          pagination={false}
        />
      </DemoBlock>

      {/* 锁定列（固定列） */}
      <DemoBlock
        title="锁定列（固定列）"
        description="左右滚动时固定列保持可见（需为固定列设置 width）。"
        code={fixedSnippet}>
        <Table<UserData> columns={fixedColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 表头锁按钮 */}
      <DemoBlock
        title="表头锁按钮"
        description="点击表头的小锁按钮锁定/解锁该列（默认锁定到左侧）。"
        code={lockableSnippet}>
        <Table<UserData>
          columns={lockableColumns}
          dataSource={basicData}
          pagination={false}
          columnLockable
        />
      </DemoBlock>

      {/* 加载状态 */}
      <DemoBlock title="加载状态" description="显示加载中的状态。" code={loadingSnippet}>
        <Table<UserData> columns={basicColumns} dataSource={basicData} loading pagination={false} />
      </DemoBlock>

      {/* 空状态 */}
      <DemoBlock title="空状态" description="没有数据时的显示。" code={emptySnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={[]}
          emptyText="暂无数据"
          pagination={false}
        />
      </DemoBlock>
    </div>
  )
}

export default TableDemo
