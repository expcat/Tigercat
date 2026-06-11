<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-vue'
import type { TableToolbarAction, TableCardLayoutItem } from '@expcat/tigercat-core'
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
    bulkActions: [
      { key: 'export', label: '导出' },
      { key: 'delete', label: '删除', variant: 'outline' }
    ],
    selectedKeys: selectedRowKeys
  }"
  :pagination="{
    current, pageSize,
    total: filteredData.length,
    showSizeChanger: true,
    showTotal: true
  }"
  @search-change="(val) => (keyword = val)"
  @filters-change="(val) => (filters = val)"
  @page-change="handlePageChange"
  @selection-change="handleSelectionChange"
/>`

const basicScriptSnippet = `import { ref } from 'vue'

const keyword = ref('')
const filters = ref<Record<string, unknown>>({ status: null, role: null })`

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名', width: '25%' },
  { key: 'email', title: '邮箱', width: '35%' },
  { key: 'role', title: '角色', width: '20%' },
  { key: 'status', title: '状态', width: '20%' }
]

// Card-mode customization: promote 姓名 to the card heading, hide secondary
// fields (ID), and order the remaining fields with cardPriority.
const cardColumns: TableColumn<Record<string, unknown>>[] = [
  { key: 'id', title: 'ID', width: '10%', hideInCard: true },
  { key: 'name', title: '姓名', width: '25%', cardTitle: true },
  { key: 'status', title: '状态', width: '20%', cardPriority: 1 },
  { key: 'role', title: '角色', width: '20%', cardPriority: 2 },
  { key: 'email', title: '邮箱', width: '25%' }
]

const cardSnippet = `// 卡片模式字段定制（窄于 cardBreakpoint 时启用）
const cardColumns = [
  { key: 'id', title: 'ID', hideInCard: true },     // 卡片中隐藏
  { key: 'name', title: '姓名', cardTitle: true },   // 卡片标题
  { key: 'status', title: '状态', cardPriority: 1 }, // 首个内容字段
  { key: 'role', title: '角色', cardPriority: 2 },
  { key: 'email', title: '邮箱' }
]

<DataTableWithToolbar
  :columns="cardColumns"
  :dataSource="pagedData"
  responsive-mode="card"
  card-breakpoint="lg"
/>`

const gridCardColumns: TableColumn<Record<string, unknown>>[] = [
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
const gridCardColumns = [
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
  :columns="gridCardColumns"
  :dataSource="pagedData"
  responsive-mode="card"
  card-breakpoint="lg"
  :card-layout="gridCardLayout"
/>`

const columnSettingsSnippet = `<!-- 工具栏列设置：内置 Popover + Checkbox 面板，驱动 Table 的 hiddenColumnKeys -->
<DataTableWithToolbar
  :columns="settingsColumns"
  :dataSource="pagedData"
  :toolbar="{ showColumnSettings: true }"
  v-model:hidden-column-keys="hiddenColumnKeys"
/>

<!-- settingsColumns 中 hideable: false 的列不可隐藏 -->
<!-- 锁定特定列：:toolbar="{ showColumnSettings: true, columnSettings: { lockedColumnKeys: ['name'] } }" -->`

const columnSettingsScriptSnippet = `import { ref } from 'vue'

const hiddenColumnKeys = ref<string[]>(['role'])

const settingsColumns = [
  { key: 'name', title: '姓名', hideable: false }, // 不可隐藏
  { key: 'email', title: '邮箱' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
]`

const settingsColumns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名', width: '25%', hideable: false },
  { key: 'email', title: '邮箱', width: '35%' },
  { key: 'role', title: '角色', width: '20%' },
  { key: 'status', title: '状态', width: '20%' }
]

const hiddenColumnKeys = ref<string[]>(['role'])

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

const bulkActions: TableToolbarAction[] = [
  { key: 'export', label: '导出' },
  { key: 'delete', label: '删除', variant: 'outline' }
]

const toolbar = computed(() => ({
  searchValue: keyword.value,
  searchPlaceholder: '搜索姓名/邮箱',
  filters: [
    { key: 'status', label: '状态', options: statusOptions },
    { key: 'role', label: '角色', options: roleOptions }
  ],
  bulkActions,
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
      <p class="text-gray-600 dark:text-gray-400">搜索、筛选、批量操作与分页联动的组合组件。</p>
    </div>

    <DemoBlock
      title="基础用法"
      description="搜索/筛选/批量操作 + 分页联动"
      :code="basicSnippet"
      :script="basicScriptSnippet">
      <DataTableWithToolbar
        :columns="columns"
        :dataSource="pagedData"
        table-layout="fixed"
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
        @search="(value) => (keyword = value)"
        @filters-change="handleFiltersChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageChange"
        @selection-change="handleSelectionChange"
        @bulk-action="(action) => handleBulkAction(action.key as string)" />
    </DemoBlock>

    <DemoBlock
      title="列设置"
      description="开启 showColumnSettings 后，工具栏右侧出现列设置入口，可勾选控制列显隐；hideable: false 的列不可隐藏。支持 v-model:hidden-column-keys 双向绑定。"
      :code="columnSettingsSnippet"
      :script="columnSettingsScriptSnippet">
      <DataTableWithToolbar
        :columns="settingsColumns"
        :dataSource="pagedData"
        table-layout="fixed"
        :toolbar="{ showColumnSettings: true }"
        v-model:hidden-column-keys="hiddenColumnKeys"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showTotal: true
        }"
        @page-change="handlePageChange" />
    </DemoBlock>

    <DemoBlock
      title="卡片模式字段定制"
      description="窄屏（小于 cardBreakpoint，此处为 lg/1024px）自动切换为卡片：姓名作为标题、ID 隐藏、状态/角色按 cardPriority 排序。缩窄窗口可预览。"
      :code="cardSnippet">
      <DataTableWithToolbar
        :columns="cardColumns"
        :dataSource="pagedData"
        responsive-mode="card"
        card-breakpoint="lg"
        :toolbar="{
          searchValue: keyword,
          searchPlaceholder: '搜索姓名/邮箱',
          filters: [
            { key: 'status', label: '状态', options: statusOptions },
            { key: 'role', label: '角色', options: roleOptions }
          ]
        }"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showTotal: true
        }"
        @search-change="(value) => (keyword = value)"
        @search="(value) => (keyword = value)"
        @filters-change="handleFiltersChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageChange" />
    </DemoBlock>

    <DemoBlock
      title="自定义卡片网格布局"
      description="使用 cardGrid 列属性或 cardLayout 集中配置，实现双列/三列混排的卡片网格布局。cardLayout 配置优先于 cardGrid；最窄屏默认单列，sm 及以上按 colSpan 混排。缩窄窗口到 lg/1024px 以下可预览效果。"
      :code="gridCardSnippet">
      <DataTableWithToolbar
        :columns="gridCardColumns"
        :dataSource="pagedData"
        responsive-mode="card"
        card-breakpoint="lg"
        :card-layout="gridCardLayout"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showTotal: true
        }"
        @page-change="handlePageChange"
        @page-size-change="handlePageChange" />
    </DemoBlock>
  </div>
</template>
