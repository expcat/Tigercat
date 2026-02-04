<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
  email: string
}

const basicSnippet = `<DataTableWithToolbar
  :columns="columns"
  :dataSource="pagedData"
  :rowSelection="{ selectedRowKeys, type: 'checkbox' }"
  :toolbar="{
    searchValue: keyword,
    searchPlaceholder: '搜索姓名/邮箱',
    filters: [
      { key: 'status', label: '状态', options: statusOptions },
      { key: 'role', label: '角色', options: roleOptions }
    ],
    bulkActions: [{ key: 'export', label: '导出' }],
    selectedKeys: selectedRowKeys
  }"
  :pagination="{ current, pageSize, total, showSizeChanger: true, showTotal: true }"
  @search-change="(val) => (keyword = val)"
  @filters-change="(val) => (filters = val)"
  @page-change="handlePageChange"
  @page-size-change="handlePageChange"
  @selection-change="handleSelectionChange"
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

const keyword = ref('')
const filters = ref<Record<string, TableToolbarFilterValue>>({
  status: null,
  role: null
})
const pagination = ref({ current: 1, pageSize: 6 })
const selectedRowKeys = ref<(string | number)[]>([])

watch([keyword, () => filters.value.status, () => filters.value.role], () => {
  pagination.value.current = 1
})

const filteredData = computed(() => {
  const lowerKeyword = keyword.value.trim().toLowerCase()
  return seedData.filter((item) => {
    const matchKeyword =
      !lowerKeyword ||
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.email.toLowerCase().includes(lowerKeyword)
    const matchStatus = !filters.value.status || item.status === filters.value.status
    const matchRole = !filters.value.role || item.role === filters.value.role
    return matchKeyword && matchStatus && matchRole
  })
})

const pagedData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredData.value.slice(start, end)
})

const toolbar = computed(() => ({
  searchValue: keyword.value,
  searchPlaceholder: '搜索姓名/邮箱',
  filters: [
    { key: 'status', label: '状态', options: statusOptions },
    { key: 'role', label: '角色', options: roleOptions }
  ],
  bulkActions: [
    { key: 'export', label: '导出' },
    { key: 'delete', label: '删除', variant: 'outline' }
  ],
  selectedKeys: selectedRowKeys.value
}))

const handlePageChange = (current: number, pageSize: number) => {
  pagination.value = { current, pageSize }
}

const handleFiltersChange = (nextFilters: Record<string, TableToolbarFilterValue>) => {
  filters.value = nextFilters
}

const handleSelectionChange = (keys: (string | number)[]) => {
  selectedRowKeys.value = keys
}

const handleBulkAction = (actionKey: string) => {
  if (selectedRowKeys.value.length === 0) return
  alert(`执行批量操作: ${actionKey}，选中 ${selectedRowKeys.value.length} 项`)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">DataTableWithToolbar 表格工具栏</h1>
      <p class="text-gray-600">搜索、筛选、批量操作与分页联动的组合组件。</p>
    </div>

    <DemoBlock title="基础用法"
               description="搜索/筛选/批量操作 + 分页联动"
               :code="basicSnippet">
      <DataTableWithToolbar
        :columns="columns"
        :dataSource="pagedData"
        :rowSelection="{ selectedRowKeys, type: 'checkbox' }"
        :toolbar="toolbar"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: true
        }"
        @search-change="(value) => (keyword = value)"
        @filters-change="handleFiltersChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageChange"
        @selection-change="handleSelectionChange"
        @bulk-action="(action) => handleBulkAction(action.key as string)" />
    </DemoBlock>
  </div>
</template>
