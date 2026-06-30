import React, { useState } from 'react'
import { Table } from '@expcat/tigercat-react/Table'
import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { type TableColumn } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './TableDemo.tsx?raw'

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

const basicScriptSnippet = `import { useState } from 'react'
import type { TableColumn } from '@expcat/tigercat-react'

interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const [basicData] = useState<UserData[]>([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com', status: 'active', address: 'New York' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com', status: 'inactive', address: 'London' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com', status: 'active', address: 'Paris' }
])

const basicColumns: TableColumn<UserData>[] = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  { key: 'email', title: 'Email', width: 200 }
]`

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

const cardModeSnippet = `const cardColumns: TableColumn<UserData>[] = [
  { key: 'id', title: 'ID', hideInCard: true },
  { key: 'name', title: 'Name', cardTitle: true },
  { key: 'status', title: 'Status', cardPriority: 1 },
  { key: 'age', title: 'Age', cardPriority: 2 },
  { key: 'email', title: 'Email' }
]

<Table<UserData>
  columns={cardColumns}
  dataSource={basicData}
  responsiveMode="card"
  cardBreakpoint="lg"
  cardFieldGap="gap-2"
  pagination={false}
/>`

const paginationSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={pagedData}
  pagination={false}
/>
<Pagination
  current={pagination.current}
  pageSize={pagination.pageSize}
  total={largeData.length}
  pageSizeOptions={[10, 20, 50]}
  showSizeChanger
  showTotal
  onChange={(current, pageSize) => setPagination({ current, pageSize })}
  onPageSizeChange={(current, pageSize) => setPagination({ current, pageSize })}
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

const selectionScriptSnippet = `import { useState } from 'react'

const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

const handleSelectionChange = (keys: (string | number)[]) => {
  setSelectedRowKeys(keys)
}`

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
  striped
  pagination={false}
/>`

const fixedStyleSnippet = `<Table<UserData>
  columns={styledFixedColumns}
  dataSource={basicData}
  rowSelection={{
    selectedRowKeys,
    type: 'checkbox'
  }}
  pagination={false}
  onSelectionChange={handleSelectionChange}
/>`

const fixedDropdownSnippet = `// Dropdown 菜单默认渲染到 body（portal），
// 不会被后续行的固定列 sticky 单元格遮挡
const dropdownColumns: TableColumn<UserData>[] = [
  { key: 'name', title: 'Name', width: 160, fixed: 'left' },
  /* ...更多列... */
  {
    key: 'actions',
    title: 'Actions',
    width: 120,
    fixed: 'right',
    render: (record) => (
      <Dropdown trigger="click" showArrow={false}>
        <Button size="sm" variant="outline">操作</Button>
        <DropdownMenu>
          <DropdownItem onClick={() => handleEdit(record)}>编辑</DropdownItem>
          <DropdownItem onClick={() => handleDelete(record)}>删除</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }
]`

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

const sizeSnippet = `<div className="space-y-6">
  <Table columns={basicColumns} dataSource={basicData} size="sm" pagination={false} />
  <Table columns={basicColumns} dataSource={basicData} size="md" pagination={false} />
  <Table columns={basicColumns} dataSource={basicData} size="lg" pagination={false} />
</div>`

const layoutSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  tableLayout="fixed"
  pagination={false}
/>`

const expandableSnippet = `<Table<UserData>
  columns={basicColumns}
  dataSource={basicData}
  expandable={{
    expandedRowKeys,
    expandedRowRender: (record) => (
      <div className="p-4 text-gray-600">
        详细信息：{record.name}，年龄 {record.age}，邮箱 {record.email}，地址 {record.address}
      </div>
    ),
    rowExpandable: (record) => record.status === 'active'
  }}
  pagination={false}
  onExpandChange={setExpandedKeys}
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

  const pagedData = largeData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )

  // Row selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])

  // Expandable rows state
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([])

  // Basic columns
  const basicColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 150 },
    { key: 'age', title: 'Age', width: 100 },
    { key: 'email', title: 'Email', width: 200 }
  ]

  const cardColumns: TableColumn<UserData>[] = [
    { key: 'id', title: 'ID', hideInCard: true },
    { key: 'name', title: 'Name', cardTitle: true },
    {
      key: 'status',
      title: 'Status',
      cardPriority: 1,
      render: (record: UserData) => {
        const color =
          record.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        return <span className={`px-2 py-1 rounded ${color}`}>{record.status}</span>
      }
    },
    { key: 'age', title: 'Age', cardPriority: 2 },
    { key: 'email', title: 'Email' }
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

  const styledFixedColumns: TableColumn<UserData>[] = [
    {
      key: 'name',
      title: 'Name',
      width: 180,
      fixed: 'left',
      fixedHeaderClassName:
        'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
      fixedClassName: ({ selected }) =>
        selected
          ? 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
          : 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)]'
    },
    { key: 'age', title: 'Age', width: 120 },
    { key: 'email', title: 'Email', width: 240 },
    { key: 'address', title: 'Address', width: 180 },
    {
      key: 'actions',
      title: 'Actions',
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
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      )
    }
  ]

  // Fixed action column with inline dropdown menus (portaled to body)
  const fixedDropdownColumns: TableColumn<UserData>[] = [
    { key: 'name', title: 'Name', width: 160, fixed: 'left' },
    { key: 'age', title: 'Age', width: 120 },
    { key: 'email', title: 'Email', width: 240 },
    { key: 'address', title: 'Address', width: 200 },
    { key: 'status', title: 'Status', width: 140 },
    {
      key: 'actions',
      title: 'Actions',
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
        <p className="text-gray-600 dark:text-gray-400">
          用于展示行列数据的表格组件，支持排序、筛选、分页等功能。
        </p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的表格展示用法。" code={fullPageSnippet}>
        <Table<UserData> columns={basicColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 带边框和条纹 */}
      <DemoBlock title="带边框和条纹" description="显示边框和条纹行。" code={fullPageSnippet}>
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
        code={fullPageSnippet}>
        <Table<UserData> columns={sortableColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 筛选 */}
      <DemoBlock title="筛选功能" description="支持文本筛选和下拉选择筛选。" code={fullPageSnippet}>
        <Table<UserData> columns={filterableColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 自定义渲染 */}
      <DemoBlock
        title="自定义列渲染"
        description="通过 render 函数自定义单元格内容。"
        code={fullPageSnippet}>
        <Table<UserData> columns={customColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      <DemoBlock
        title="响应式卡片模式"
        description='显式设置 responsiveMode="card" 后，窄于 cardBreakpoint 时切换为卡片。列定义可配置布局属性，支持使用 cardFieldGap 自定义字段间距（如 gap-2，默认 gap-3）。'
        code={fullPageSnippet}>
        <Table<UserData>
          columns={cardColumns}
          dataSource={basicData}
          responsiveMode="card"
          cardBreakpoint="lg"
          cardFieldGap="gap-2"
          pagination={false}
        />
      </DemoBlock>

      {/* 分页 */}
      <DemoBlock
        title="分页功能"
        description="大数据集的分页展示（受控模式）。"
        code={fullPageSnippet}>
        <div className="space-y-3">
          <Table<UserData> columns={basicColumns} dataSource={pagedData} pagination={false} />
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={largeData.length}
            pageSizeOptions={[10, 20, 50]}
            showSizeChanger
            showTotal
            onChange={(current, pageSize) => setPagination({ current, pageSize })}
            onPageSizeChange={(current, pageSize) => setPagination({ current, pageSize })}
          />
        </div>
      </DemoBlock>

      {/* 行选择 */}
      <DemoBlock title="行选择" description="选择单行或多行数据。" code={fullPageSnippet}>
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
      <DemoBlock title="固定表头" description="表头固定，内容可滚动。" code={fullPageSnippet}>
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
        description="左右滚动时固定列保持可见（需为固定列设置 width）；开启 striped 时斑马纹行的固定单元格保持不透明。"
        code={fullPageSnippet}>
        <Table<UserData> columns={fixedColumns} dataSource={basicData} striped pagination={false} />
      </DemoBlock>

      <DemoBlock
        title="固定列样式自定义"
        description="通过 fixedClassName / fixedHeaderClassName 按列覆盖 sticky 单元格外观；下面示例会在勾选行后高亮固定列。"
        code={fullPageSnippet}>
        <Table<UserData>
          columns={styledFixedColumns}
          dataSource={basicData}
          rowSelection={{
            selectedRowKeys,
            type: 'checkbox'
          }}
          pagination={false}
          onSelectionChange={handleSelectionChange}
        />
      </DemoBlock>

      <DemoBlock
        title="固定列内的下拉菜单"
        description="行内 Dropdown 菜单默认渲染到 body（portal），展开后不会被后续行的固定列遮挡，也不会被表格滚动容器裁剪。如需回到旧的原位渲染，可设置 portal={false}。"
        code={fullPageSnippet}>
        <Table<UserData> columns={fixedDropdownColumns} dataSource={basicData} pagination={false} />
      </DemoBlock>

      {/* 表头锁按钮 */}
      <DemoBlock
        title="表头锁按钮"
        description="点击表头的小锁按钮锁定/解锁该列（默认锁定到左侧）。"
        code={fullPageSnippet}>
        <Table<UserData>
          columns={lockableColumns}
          dataSource={basicData}
          pagination={false}
          columnLockable
        />
      </DemoBlock>

      {/* 加载状态 */}
      <DemoBlock title="加载状态" description="显示加载中的状态。" code={fullPageSnippet}>
        <Table<UserData> columns={basicColumns} dataSource={basicData} loading pagination={false} />
      </DemoBlock>

      {/* 空状态 */}
      <DemoBlock title="空状态" description="没有数据时的显示。" code={fullPageSnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={[]}
          emptyText="暂无数据"
          pagination={false}
        />
      </DemoBlock>

      {/* 尺寸变体 */}
      <DemoBlock
        title="尺寸变体"
        description="通过 size 属性设置表格的紧凑程度：sm / md / lg。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">size="sm"</p>
            <Table<UserData>
              columns={basicColumns}
              dataSource={basicData}
              size="sm"
              pagination={false}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">size="md"（默认）</p>
            <Table<UserData>
              columns={basicColumns}
              dataSource={basicData}
              size="md"
              pagination={false}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">size="lg"</p>
            <Table<UserData>
              columns={basicColumns}
              dataSource={basicData}
              size="lg"
              pagination={false}
            />
          </div>
        </div>
      </DemoBlock>

      {/* 固定布局 */}
      <DemoBlock
        title="固定布局"
        description='tableLayout="fixed" 使列宽按设定平均分配，不随内容自适应。'
        code={fullPageSnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={basicData}
          tableLayout="fixed"
          pagination={false}
        />
      </DemoBlock>

      {/* 可展开行 */}
      <DemoBlock
        title="可展开行"
        description="通过 expandable 配置展开行内容，支持受控展开和行级禁用。仅 status=active 的行可展开。"
        code={fullPageSnippet}>
        <Table<UserData>
          columns={basicColumns}
          dataSource={basicData}
          expandable={{
            expandedRowKeys: expandedKeys,
            expandedRowRender: (record: UserData) => (
              <div className="p-4 text-gray-600">
                详细信息：{record.name}，年龄 {record.age}，邮箱 {record.email}，地址{' '}
                {record.address}
              </div>
            ),
            rowExpandable: (record: UserData) => record.status === 'active'
          }}
          pagination={false}
          onExpandChange={setExpandedKeys}
        />
      </DemoBlock>
    </div>
  )
}

export default TableDemo
