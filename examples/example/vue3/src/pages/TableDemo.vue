<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { Table, Button, Space, Pagination, type TableColumn } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

// Basic data
interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const basicSnippet = `<Table :columns="basicColumns" :dataSource="basicData" :pagination="false" />`

const borderedSnippet = `<Table
  :columns="basicColumns"
  :dataSource="basicData"
  bordered
  striped
  :pagination="false" />`

const sortingSnippet = `<Table :columns="sortableColumns" :dataSource="basicData" :pagination="false" />`

const filterSnippet = `<Table :columns="filterableColumns" :dataSource="basicData" :pagination="false" />`

const customSnippet = `<Table :columns="customColumns" :dataSource="basicData" :pagination="false" />`

const paginationSnippet = `<Table
  :columns="basicColumns"
  :dataSource="pagedData"
  :pagination="false" />
<Pagination
  :current="pagination.current"
  :pageSize="pagination.pageSize"
  :total="largeData.length"
  :pageSizeOptions="[10, 20, 50]"
  showSizeChanger
  showTotal
  @change="handlePageChange"
  @page-size-change="handlePageChange" />`

const selectionSnippet = `<div class="mb-4">
  <p class="text-sm text-gray-600">已选择: {{ selectedRowKeys.join(', ') || '无' }}</p>
</div>
<Table
  :columns="basicColumns"
  :dataSource="basicData"
  :rowSelection="{
    selectedRowKeys: selectedRowKeys,
    type: 'checkbox'
  }"
  :pagination="false"
  @selection-change="handleSelectionChange" />`

const stickySnippet = `<Table
  :columns="basicColumns"
  :dataSource="largeData"
  stickyHeader
  :maxHeight="400"
  :pagination="false" />`

const fixedSnippet = `<Table :columns="fixedColumns" :dataSource="basicData" :pagination="false" />`

const lockableSnippet = `<Table
  :columns="lockableColumns"
  :dataSource="basicData"
  :pagination="false"
  columnLockable />`

const loadingSnippet = `<Table :columns="basicColumns" :dataSource="basicData" loading :pagination="false" />`

const emptySnippet = `<Table
  :columns="basicColumns"
  :dataSource="[]"
  emptyText="暂无数据"
  :pagination="false" />`

const sizeSnippet = `<div class="space-y-6">
  <Table :columns="basicColumns" :dataSource="basicData" size="sm" :pagination="false" />
  <Table :columns="basicColumns" :dataSource="basicData" size="md" :pagination="false" />
  <Table :columns="basicColumns" :dataSource="basicData" size="lg" :pagination="false" />
</div>`

const layoutSnippet = `<Table
  :columns="basicColumns"
  :dataSource="basicData"
  tableLayout="fixed"
  :pagination="false" />`

const expandableSnippet = `<Table
  :columns="basicColumns"
  :dataSource="basicData"
  :expandable="{
    expandedRowKeys: expandedKeys,
    expandedRowRender: (record) => h('div', { class: 'p-4 text-gray-600' },
      \`详细信息：\${record.name}，年龄 \${record.age}，邮箱 \${record.email}，地址 \${record.address}\`
    ),
    rowExpandable: (record) => record.status === 'active'
  }"
  :pagination="false"
  @expand-change="(keys) => (expandedKeys = keys)" />`

const basicData = ref<UserData[]>([
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

// Basic columns
const basicColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  { key: 'email', title: 'Email', width: 200 }
]

// Sortable columns
const sortableColumns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true, width: 150 },
  { key: 'age', title: 'Age', sortable: true, width: 100 },
  { key: 'email', title: 'Email', width: 200 }
]

// Filterable columns
const filterableColumns: TableColumn[] = [
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
const customColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  {
    key: 'status',
    title: 'Status',
    width: 120,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      const color =
        typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, typedRecord.status)
    }
  },
  {
    key: 'actions',
    title: 'Actions',
    align: 'center',
    width: 150,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      return h(Space, {}, () => [
        h(
          Button,
          {
            size: 'sm',
            onClick: () => handleEdit(typedRecord)
          },
          () => 'Edit'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'secondary',
            onClick: () => handleDelete(typedRecord)
          },
          () => 'Delete'
        )
      ])
    }
  }
]

// Fixed columns (sticky left/right)
const fixedColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 160, fixed: 'left' },
  { key: 'age', title: 'Age', width: 120 },
  { key: 'email', title: 'Email', width: 240 },
  { key: 'address', title: 'Address', width: 160 },
  {
    key: 'status',
    title: 'Status',
    width: 140,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      const color =
        typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, typedRecord.status)
    }
  },
  {
    key: 'actions',
    title: 'Actions',
    align: 'center',
    width: 180,
    fixed: 'right',
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      return h(Space, {}, () => [
        h(
          Button,
          {
            size: 'sm',
            onClick: () => handleEdit(typedRecord)
          },
          () => 'Edit'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'secondary',
            onClick: () => handleDelete(typedRecord)
          },
          () => 'Delete'
        )
      ])
    }
  }
]

// Lockable columns (toggle fixed via header lock button)
const lockableColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 160 },
  { key: 'age', title: 'Age', width: 120 },
  { key: 'email', title: 'Email', width: 260 },
  { key: 'address', title: 'Address', width: 200 },
  { key: 'status', title: 'Status', width: 160 },
  { key: 'actions', title: 'Actions', width: 200, align: 'center' }
]

// Row selection
const selectedRowKeys = ref<number[]>([])

// Expandable rows
const expandedKeys = ref<(string | number)[]>([])

// Controlled pagination
const pagination = ref({
  current: 1,
  pageSize: 10
})

function handleEdit(record: UserData) {
  alert(`Editing: ${record.name}`)
}

function handleDelete(record: UserData) {
  if (confirm(`Delete ${record.name}?`)) {
    const index = basicData.value.findIndex((item) => item.id === record.id)
    if (index > -1) {
      basicData.value.splice(index, 1)
      selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== record.id)
    }
  }
}

function handleSelectionChange(keys: (string | number)[]) {
  selectedRowKeys.value = keys as number[]
}

function handlePageChange(current: number, pageSize: number) {
  pagination.value = { current, pageSize }
}

// Large dataset for pagination demo
const largeData = ref(
  Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 40),
    email: `user${i + 1}@example.com`,
    status: i % 3 === 0 ? 'inactive' : ('active' as 'active' | 'inactive'),
    address: ['New York', 'London', 'Paris', 'Tokyo', 'Berlin'][i % 5]
  }))
)

const pagedData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  return largeData.value.slice(start, start + pagination.value.pageSize)
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Table 表格</h1>
      <p class="text-gray-600">用于展示行列数据的表格组件，支持排序、筛选、分页等功能。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="基础的表格展示用法。"
               :code="basicSnippet">
      <Table :columns="basicColumns"
             :dataSource="basicData"
             :pagination="false" />
    </DemoBlock>

    <!-- 带边框和条纹 -->
    <DemoBlock title="带边框和条纹"
               description="显示边框和条纹行。"
               :code="borderedSnippet">
      <Table :columns="basicColumns"
             :dataSource="basicData"
             bordered
             striped
             :pagination="false" />
    </DemoBlock>

    <!-- 排序 -->
    <DemoBlock title="排序功能"
               description="点击列头进行排序，支持升序、降序和取消排序。"
               :code="sortingSnippet">
      <Table :columns="sortableColumns"
             :dataSource="basicData"
             :pagination="false" />
    </DemoBlock>

    <!-- 筛选 -->
    <DemoBlock title="筛选功能"
               description="支持文本筛选和下拉选择筛选。"
               :code="filterSnippet">
      <Table :columns="filterableColumns"
             :dataSource="basicData"
             :pagination="false" />
    </DemoBlock>

    <!-- 自定义渲染 -->
    <DemoBlock title="自定义列渲染"
               description="通过 render 函数自定义单元格内容。"
               :code="customSnippet">
      <Table :columns="customColumns"
             :dataSource="basicData"
             :pagination="false" />
    </DemoBlock>

    <!-- 分页 -->
    <DemoBlock title="分页功能"
               description="大数据集的分页展示（受控模式）。"
               :code="paginationSnippet">
      <div class="space-y-3">
        <Table :columns="basicColumns"
               :dataSource="pagedData"
               :pagination="false" />
        <Pagination :current="pagination.current"
                    :pageSize="pagination.pageSize"
                    :total="largeData.length"
                    :pageSizeOptions="[10, 20, 50]"
                    showSizeChanger
                    showTotal
                    @change="handlePageChange"
                    @page-size-change="handlePageChange" />
      </div>
    </DemoBlock>

    <!-- 行选择 -->
    <DemoBlock title="行选择"
               description="选择单行或多行数据。"
               :code="selectionSnippet">
      <div class="mb-4">
        <p class="text-sm text-gray-600">已选择: {{ selectedRowKeys.join(', ') || '无' }}</p>
      </div>
      <Table :columns="basicColumns"
             :dataSource="basicData"
             :rowSelection="{
              selectedRowKeys: selectedRowKeys,
              type: 'checkbox'
            }"
             :pagination="false"
             @selection-change="handleSelectionChange" />
    </DemoBlock>

    <!-- 固定表头 -->
    <DemoBlock title="固定表头"
               description="表头固定，内容可滚动。"
               :code="stickySnippet">
      <Table :columns="basicColumns"
             :dataSource="largeData"
             stickyHeader
             :maxHeight="400"
             :pagination="false" />
    </DemoBlock>

    <!-- 锁定列（固定列） -->
    <DemoBlock title="锁定列（固定列）"
               description="左右滚动时固定列保持可见（需为固定列设置 width）。"
               :code="fixedSnippet">
      <Table :columns="fixedColumns"
             :dataSource="basicData"
             :pagination="false" />
    </DemoBlock>

    <!-- 表头锁按钮 -->
    <DemoBlock title="表头锁按钮"
               description="点击表头的小锁按钮锁定/解锁该列（默认锁定到左侧）。"
               :code="lockableSnippet">
      <Table :columns="lockableColumns"
             :dataSource="basicData"
             :pagination="false"
             columnLockable />
    </DemoBlock>

    <!-- 加载状态 -->
    <DemoBlock title="加载状态"
               description="显示加载中的状态。"
               :code="loadingSnippet">
      <Table :columns="basicColumns"
             :dataSource="basicData"
             loading
             :pagination="false" />
    </DemoBlock>

    <!-- 空状态 -->
    <DemoBlock title="空状态"
               description="没有数据时的显示。"
               :code="emptySnippet">
      <Table :columns="basicColumns"
             :dataSource="[]"
             emptyText="暂无数据"
             :pagination="false" />
    </DemoBlock>

    <!-- 尺寸变体 -->
    <DemoBlock title="尺寸变体"
               description="通过 size 属性设置表格的紧凑程度：sm / md / lg。"
               :code="sizeSnippet">
      <div class="space-y-6">
        <div>
          <p class="text-sm text-gray-500 mb-2">size="sm"</p>
          <Table :columns="basicColumns"
                 :dataSource="basicData"
                 size="sm"
                 :pagination="false" />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">size="md"（默认）</p>
          <Table :columns="basicColumns"
                 :dataSource="basicData"
                 size="md"
                 :pagination="false" />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">size="lg"</p>
          <Table :columns="basicColumns"
                 :dataSource="basicData"
                 size="lg"
                 :pagination="false" />
        </div>
      </div>
    </DemoBlock>

    <!-- 固定布局 -->
    <DemoBlock title="固定布局"
               description="tableLayout=&quot;fixed&quot; 使列宽按设定平均分配，不随内容自适应。"
               :code="layoutSnippet">
      <Table :columns="basicColumns"
             :dataSource="basicData"
             tableLayout="fixed"
             :pagination="false" />
    </DemoBlock>

    <!-- 可展开行 -->
    <DemoBlock title="可展开行"
               description="通过 expandable 配置展开行内容，支持受控展开和行级禁用。仅 status=active 的行可展开。"
               :code="expandableSnippet">
      <Table :columns="basicColumns"
             :dataSource="basicData"
             :expandable="{
               expandedRowKeys: expandedKeys,
               expandedRowRender: (record: Record<string, unknown>) => {
                 const r = record as UserData
                 return h('div', { class: 'p-4 text-gray-600' },
                   `详细信息：${r.name}，年龄 ${r.age}，邮箱 ${r.email}，地址 ${r.address}`
                 )
               },
               rowExpandable: (record: Record<string, unknown>) => (record as UserData).status === 'active'
             }"
             :pagination="false"
             @expand-change="(keys: (string | number)[]) => (expandedKeys = keys)" />
    </DemoBlock>
  </div>
</template>
