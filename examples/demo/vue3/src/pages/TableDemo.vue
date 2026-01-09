<script setup lang="ts">
import { ref, h } from 'vue'
import { Table, Button, Space, type TableColumn } from '@tigercat/vue'

// Basic data
interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const basicData = ref<UserData[]>([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com', status: 'active', address: 'New York' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com', status: 'inactive', address: 'London' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com', status: 'active', address: 'Paris' },
  { id: 4, name: 'Alice Brown', age: 29, email: 'alice@example.com', status: 'active', address: 'Tokyo' },
  { id: 5, name: 'Charlie Wilson', age: 38, email: 'charlie@example.com', status: 'inactive', address: 'Berlin' },
])

// Basic columns
const basicColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  { key: 'email', title: 'Email', width: 200 },
]

// Sortable columns
const sortableColumns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true, width: 150 },
  { key: 'age', title: 'Age', sortable: true, width: 100 },
  { key: 'email', title: 'Email', width: 200 },
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
        { value: 'inactive', label: 'Inactive' },
      ]
    },
    width: 120
  },
  { key: 'email', title: 'Email', width: 200 },
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
      const color = typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
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
        h(Button, {
          size: 'sm',
          onClick: () => handleEdit(typedRecord)
        }, () => 'Edit'),
        h(Button, {
          size: 'sm',
          variant: 'secondary',
          onClick: () => handleDelete(typedRecord)
        }, () => 'Delete')
      ])
    }
  },
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
      const color = typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, typedRecord.status)
    },
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
        h(Button, {
          size: 'sm',
          onClick: () => handleEdit(typedRecord)
        }, () => 'Edit'),
        h(Button, {
          size: 'sm',
          variant: 'secondary',
          onClick: () => handleDelete(typedRecord)
        }, () => 'Delete')
      ])
    },
  },
]

// Lockable columns (toggle fixed via header lock button)
const lockableColumns: TableColumn[] = [
  { key: 'name', title: 'Name', width: 160 },
  { key: 'age', title: 'Age', width: 120 },
  { key: 'email', title: 'Email', width: 260 },
  { key: 'address', title: 'Address', width: 200 },
  { key: 'status', title: 'Status', width: 160 },
  { key: 'actions', title: 'Actions', width: 200, align: 'center' },
]

// Row selection
const selectedRowKeys = ref<number[]>([])

function handleEdit(record: UserData) {
  alert(`Editing: ${record.name}`)
}

function handleDelete(record: UserData) {
  if (confirm(`Delete ${record.name}?`)) {
    const index = basicData.value.findIndex(item => item.id === record.id)
    if (index > -1) {
      basicData.value.splice(index, 1)
      selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== record.id)
    }
  }
}

function handleSelectionChange(keys: (string | number)[]) {
  selectedRowKeys.value = keys as number[]
}

// Large dataset for pagination demo
const largeData = ref(
  Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 40),
    email: `user${i + 1}@example.com`,
    status: i % 3 === 0 ? 'inactive' : 'active' as 'active' | 'inactive',
    address: ['New York', 'London', 'Paris', 'Tokyo', 'Berlin'][i % 5],
  }))
)
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Table 表格</h1>
      <p class="text-gray-600">用于展示行列数据的表格组件，支持排序、筛选、分页等功能。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的表格展示用法。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="basicData"
               :pagination="false" />
      </div>
    </section>

    <!-- 带边框和条纹 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带边框和条纹</h2>
      <p class="text-gray-600 mb-6">显示边框和条纹行。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="basicData"
               bordered
               striped
               :pagination="false" />
      </div>
    </section>

    <!-- 排序 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">排序功能</h2>
      <p class="text-gray-600 mb-6">点击列头进行排序，支持升序、降序和取消排序。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="sortableColumns"
               :dataSource="basicData"
               :pagination="false" />
      </div>
    </section>

    <!-- 筛选 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">筛选功能</h2>
      <p class="text-gray-600 mb-6">支持文本筛选和下拉选择筛选。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="filterableColumns"
               :dataSource="basicData"
               :pagination="false" />
      </div>
    </section>

    <!-- 自定义渲染 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义列渲染</h2>
      <p class="text-gray-600 mb-6">通过 render 函数自定义单元格内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="customColumns"
               :dataSource="basicData"
               :pagination="false" />
      </div>
    </section>

    <!-- 分页 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">分页功能</h2>
      <p class="text-gray-600 mb-6">大数据集的分页展示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="largeData"
               :pagination="{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: true,
              }" />
      </div>
    </section>

    <!-- 行选择 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">行选择</h2>
      <p class="text-gray-600 mb-6">选择单行或多行数据。</p>
      <div class="mb-4">
        <p class="text-sm text-gray-600">已选择: {{ selectedRowKeys.join(', ') || '无' }}</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="basicData"
               :rowSelection="{
                selectedRowKeys: selectedRowKeys,
                type: 'checkbox',
              }"
               :pagination="false"
               @selection-change="handleSelectionChange" />
      </div>
    </section>

    <!-- 固定表头 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">固定表头</h2>
      <p class="text-gray-600 mb-6">表头固定，内容可滚动。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="largeData"
               stickyHeader
               :maxHeight="400"
               :pagination="false" />
      </div>
    </section>

    <!-- 锁定列（固定列） -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">锁定列（固定列）</h2>
      <p class="text-gray-600 mb-6">左右滚动时固定列保持可见（需为固定列设置 width）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="fixedColumns"
               :dataSource="basicData"
               :pagination="false" />
      </div>
    </section>

    <!-- 表头锁按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">表头锁按钮</h2>
      <p class="text-gray-600 mb-6">点击表头的小锁按钮锁定/解锁该列（默认锁定到左侧）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="lockableColumns"
               :dataSource="basicData"
               :pagination="false"
               columnLockable />
      </div>
    </section>

    <!-- 加载状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">加载状态</h2>
      <p class="text-gray-600 mb-6">显示加载中的状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="basicData"
               loading
               :pagination="false" />
      </div>
    </section>

    <!-- 空状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">空状态</h2>
      <p class="text-gray-600 mb-6">没有数据时的显示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Table :columns="basicColumns"
               :dataSource="[]"
               emptyText="暂无数据"
               :pagination="false" />
      </div>
    </section>
  </div>
</template>
