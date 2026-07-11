<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { computed, ref, h } from 'vue'
import { Table } from '@expcat/tigercat-vue/Table'
import { type TableColumn } from '@expcat/tigercat-vue'

// Basic data
interface UserData extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
  address: string
}

const getStatusText = (status: UserData['status']) => (status === 'active' ? '启用' : '停用')

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
  { key: 'name', title: '姓名', width: 150 },
  { key: 'age', title: '年龄', width: 100 },
  { key: 'email', title: '邮箱', width: 200 }
]

const cardColumns: TableColumn[] = [
  { key: 'id', title: 'ID', hideInCard: true },
  { key: 'name', title: '姓名', cardTitle: true },
  {
    key: 'status',
    title: '状态',
    cardPriority: 1,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      const color =
        typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, getStatusText(typedRecord.status))
    }
  },
  { key: 'age', title: '年龄', cardPriority: 2 },
  { key: 'email', title: '邮箱' }
]

// Sortable columns
const sortableColumns: TableColumn[] = [
  { key: 'name', title: '姓名', sortable: true, width: 150 },
  { key: 'age', title: '年龄', sortable: true, width: 100 },
  { key: 'email', title: '邮箱', width: 200 }
]

// Filterable columns
const filterableColumns: TableColumn[] = [
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
const customColumns: TableColumn[] = [
  { key: 'name', title: '姓名', width: 150 },
  { key: 'age', title: '年龄', width: 100 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      const color =
        typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, getStatusText(typedRecord.status))
    }
  },
  {
    key: 'actions',
    title: '操作',
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
          () => '编辑'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'secondary',
            onClick: () => handleDelete(typedRecord)
          },
          () => '删除'
        )
      ])
    }
  }
]

// Fixed columns (sticky left/right)
const fixedColumns: TableColumn[] = [
  { key: 'name', title: '姓名', width: 160, fixed: 'left' },
  { key: 'age', title: '年龄', width: 120 },
  { key: 'email', title: '邮箱', width: 240 },
  { key: 'address', title: '地址', width: 160 },
  {
    key: 'status',
    title: '状态',
    width: 140,
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      const color =
        typedRecord.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      return h('span', { class: `px-2 py-1 rounded ${color}` }, getStatusText(typedRecord.status))
    }
  },
  {
    key: 'actions',
    title: '操作',
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
          () => '编辑'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'secondary',
            onClick: () => handleDelete(typedRecord)
          },
          () => '删除'
        )
      ])
    }
  }
]

const fixedDropdownColumns: TableColumn[] = [
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
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      return h(Dropdown, { trigger: 'click', showArrow: false }, () => [
        h(Button, { size: 'sm', variant: 'outline' }, () => '操作'),
        h(DropdownMenu, null, () => [
          h(DropdownItem, { onClick: () => handleEdit(typedRecord) }, () => '编辑'),
          h(DropdownItem, { onClick: () => handleDelete(typedRecord) }, () => '删除')
        ])
      ])
    }
  }
]

const styledFixedColumns: TableColumn[] = [
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
    render: (record: Record<string, unknown>) => {
      const typedRecord = record as UserData
      return h(Space, {}, () => [
        h(
          Button,
          {
            size: 'sm',
            onClick: () => handleEdit(typedRecord)
          },
          () => '编辑'
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'secondary',
            onClick: () => handleDelete(typedRecord)
          },
          () => '删除'
        )
      ])
    }
  }
]

// Lockable columns (toggle fixed via header lock button)
const lockableColumns: TableColumn[] = [
  { key: 'name', title: '姓名', width: 160 },
  { key: 'age', title: '年龄', width: 120 },
  { key: 'email', title: '邮箱', width: 260 },
  { key: 'address', title: '地址', width: 200 },
  { key: 'status', title: '状态', width: 160 },
  { key: 'actions', title: '操作', width: 200, align: 'center' }
]

// Row selection
const selectedRowKeys = ref<number[]>([])
const lastAction = ref('尚未执行表格操作')

// Expandable rows
const expandedKeys = ref<(string | number)[]>([])

// Controlled pagination
const pagination = ref({
  current: 1,
  pageSize: 10
})

function handleEdit(record: UserData) {
  lastAction.value = `正在编辑：${record.name}`
}

function handleDelete(record: UserData) {
  if (confirm(`确认删除 ${record.name}？`)) {
    const index = basicData.value.findIndex((item) => item.id === record.id)
    if (index > -1) {
      basicData.value.splice(index, 1)
      selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== record.id)
      lastAction.value = `已删除：${record.name}`
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
  <div class="min-w-0">
    <Table :columns="fixedColumns" :dataSource="basicData" striped :pagination="false" />
  </div>
</template>
