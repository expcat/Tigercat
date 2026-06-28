<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import { type TableColumn, type TableToolbarFilterValue } from '@expcat/tigercat-vue'
import type { TableToolbarAction, TableCardLayoutItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
  email: string
  age: number
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
  { key: 'name', title: '姓名', width: '22%' },
  { key: 'email', title: '邮箱', width: '32%' },
  { key: 'age', title: '年龄', width: '12%' },
  { key: 'role', title: '角色', width: '17%' },
  { key: 'status', title: '状态', width: '17%' }
]

// Card-mode customization: promote 姓名 to the card heading, hide secondary
// fields (ID), and order the remaining fields with cardPriority.
const cardColumns: TableColumn<Record<string, unknown>>[] = [
  { key: 'id', title: 'ID', width: '10%', hideInCard: true },
  { key: 'name', title: '姓名', width: '25%', cardTitle: true },
  { key: 'status', title: '状态', width: '20%', cardPriority: 1 },
  { key: 'role', title: '角色', width: '20%', cardPriority: 2 },
  { key: 'age', title: '年龄', width: '10%', cardPriority: 3 },
  { key: 'email', title: '邮箱', width: '15%' }
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

const columnLockSnippet = `<!-- 钉列 / 锁定列：
  1) column.fixed: 'left' | 'right' —— 横向滚动时把列钉在边缘（sticky）
  2) column-lockable —— 表头出现锁定按钮，锁定后该列进入左侧固定区
  3) columnSettings.lockedColumnKeys —— 列设置面板中该列不可隐藏 -->
<DataTableWithToolbar
  :columns="lockColumns"
  :dataSource="pagedData"
  column-lockable
  :toolbar="{
    showColumnSettings: true,
    columnSettings: { lockedColumnKeys: ['name'] }
  }"
/>`

const columnLockScriptSnippet = `const lockColumns = [
  { key: 'name', title: '姓名', width: 200, fixed: 'left', hideable: false },
  { key: 'email', title: '邮箱', width: 400 },
  { key: 'age', title: '年龄', width: 200 },
  { key: 'role', title: '角色', width: 240 },
  { key: 'status', title: '状态', width: 240 }
]`

const columnSettingsScriptSnippet = `import { ref } from 'vue'

const hiddenColumnKeys = ref<string[]>(['role'])

const settingsColumns = [
  { key: 'name', title: '姓名', hideable: false }, // 不可隐藏
  { key: 'email', title: '邮箱' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
]`

const ageRangeSnippet = `<DataTableWithToolbar
  :columns="columns"
  :dataSource="pagedData"
  :toolbar="toolbar"
  @filters-change="handleFiltersChange">
  <template #filters-extra="{ filters, setFilter }">
    <div class="flex items-center gap-2">
      <span>年龄段</span>
      <input
        :value="getAgeRange(filters.ageRange).min ?? ''"
        @input="(event) => setAgeRangeFilter(setFilter, filters.ageRange, 'min', event)" />
      <span>-</span>
      <input
        :value="getAgeRange(filters.ageRange).max ?? ''"
        @input="(event) => setAgeRangeFilter(setFilter, filters.ageRange, 'max', event)" />
    </div>
  </template>
</DataTableWithToolbar>`

const settingsColumns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名', width: '22%', hideable: false },
  { key: 'email', title: '邮箱', width: '32%' },
  { key: 'age', title: '年龄', width: '12%' },
  { key: 'role', title: '角色', width: '17%' },
  { key: 'status', title: '状态', width: '17%' }
]

const lockColumns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名', width: 200, fixed: 'left', hideable: false },
  { key: 'email', title: '邮箱', width: 400 },
  { key: 'age', title: '年龄', width: 200 },
  { key: 'role', title: '角色', width: 240 },
  { key: 'status', title: '状态', width: 240 }
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
    age: 22 + (index % 18),
    email: `user${index + 1}@example.com`
  }
})

const keyword = ref('')
const filters = ref<Record<string, TableToolbarFilterValue>>({
  status: null,
  role: null,
  ageRange: null
})
const pagination = ref({ current: 1, pageSize: 6 })
const selectedRowKeys = ref<(string | number)[]>([])

watch(
  [keyword, () => filters.value.status, () => filters.value.role, () => filters.value.ageRange],
  () => {
    pagination.value.current = 1
  }
)

const getAgeRange = (value: TableToolbarFilterValue) =>
  value && typeof value === 'object' ? (value as { min?: string; max?: string }) : {}

const setAgeRangeFilter = (
  setFilter: (key: string, value: TableToolbarFilterValue) => void,
  value: TableToolbarFilterValue,
  key: 'min' | 'max',
  event: Event
) => {
  setFilter('ageRange', {
    ...getAgeRange(value),
    [key]: (event.target as HTMLInputElement).value
  })
}

const filteredData = computed(() => {
  const lowerKeyword = keyword.value.trim().toLowerCase()
  const ageRange = getAgeRange(filters.value.ageRange)
  const minAge = ageRange.min ? Number(ageRange.min) : undefined
  const maxAge = ageRange.max ? Number(ageRange.max) : undefined
  return seedData.filter((item) => {
    const matchKeyword =
      !lowerKeyword ||
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.email.toLowerCase().includes(lowerKeyword)
    const matchStatus = !filters.value.status || item.status === filters.value.status
    const matchRole = !filters.value.role || item.role === filters.value.role
    const matchAge =
      (minAge === undefined || item.age >= minAge) && (maxAge === undefined || item.age <= maxAge)
    return matchKeyword && matchStatus && matchRole && matchAge
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

const itemClassSnippet = `<!-- 自定义 filter 容器宽度 -->
<DataTableWithToolbar
  :columns="columns"
  :dataSource="pagedData"
  :toolbar="{
    filters: [
      {
        key: 'status', label: '状态',
        options: statusOptions,
        itemClass: 'w-full sm:w-auto sm:min-w-[200px] sm:max-w-[280px]',
        itemStyle: { borderRadius: '8px' }
      },
      { key: 'role', label: '角色', options: roleOptions }
    ],
    searchClassName: 'w-full sm:w-auto sm:min-w-[300px]',
    className: 'bg-gray-50 dark:bg-gray-800/50',
    style: { padding: '12px 16px' }
  }" />`

const customToolbarSnippet = `<!-- 完全自定义工具栏（替换内置 toolbar 区域） -->
<DataTableWithToolbar
  :columns="columns"
  :dataSource="pagedData"
  :toolbar="{ filters: [...] }">
  <template #toolbar="{ searchValue, setSearch, submitSearch, filters, setFilter }">
    <div role="toolbar" class="flex items-center gap-4 p-4">
      <input :value="searchValue" @input="setSearch($event.target.value)" />
      <button @click="submitSearch">搜索</button>
    </div>
  </template>
</DataTableWithToolbar>`

const cardSlotSnippet = `<!-- 卡片自定义渲染 -->
<DataTableWithToolbar
  :columns="cardColumns"
  :dataSource="pagedData"
  responsive-mode="card"
  card-breakpoint="lg"
  card-class-name="shadow-lg rounded-xl">
  <template #card="{ record, columns }">
    <div class="p-4">
      <h3 class="font-bold">{{ record.name }}</h3>
      <p class="text-sm text-gray-500">{{ record.email }}</p>
    </div>
  </template>
</DataTableWithToolbar>`
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
      title="自定义过滤器"
      description="filters-extra 插槽可把年龄段等复合控件放入工具栏，并通过 setFilter 发出对象型过滤值。"
      :code="ageRangeSnippet">
      <DataTableWithToolbar
        :columns="columns"
        :dataSource="pagedData"
        table-layout="fixed"
        :toolbar="toolbar"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showTotal: true
        }"
        @search-change="(value) => (keyword = value)"
        @search="(value) => (keyword = value)"
        @filters-change="handleFiltersChange"
        @page-change="handlePageChange">
        <template #filters-extra="{ filters, setFilter }">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">年龄段</span>
            <input
              class="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
              :value="getAgeRange(filters.ageRange).min ?? ''"
              placeholder="最小"
              @input="(event) => setAgeRangeFilter(setFilter, filters.ageRange, 'min', event)" />
            <span class="text-gray-400">-</span>
            <input
              class="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
              :value="getAgeRange(filters.ageRange).max ?? ''"
              placeholder="最大"
              @input="(event) => setAgeRangeFilter(setFilter, filters.ageRange, 'max', event)" />
          </div>
        </template>
      </DataTableWithToolbar>
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
      title="钉列 / 锁定列"
      description="column.fixed 让列在横向滚动时钉在边缘（姓名列钉在左侧）；开启 column-lockable 后表头出现锁定按钮，锁定列会进入左侧固定区，未锁定列向右排列；columnSettings.lockedColumnKeys 让该列在列设置面板中不可隐藏。横向滚动表格可观察钉列效果。"
      :code="columnLockSnippet"
      :script="columnLockScriptSnippet">
      <DataTableWithToolbar
        :columns="lockColumns"
        :dataSource="pagedData"
        column-lockable
        :toolbar="{
          showColumnSettings: true,
          columnSettings: { lockedColumnKeys: ['name'] }
        }"
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

    <DemoBlock
      title="工具栏布局定制"
      description="通过 itemClass/itemStyle 定制单个 filter 容器宽度（替换默认尺寸类），searchClassName 定制搜索框尺寸，toolbar.className/style 定制容器样式。"
      :code="itemClassSnippet">
      <DataTableWithToolbar
        :columns="columns"
        :dataSource="pagedData"
        table-layout="fixed"
        :toolbar="{
          searchValue: keyword,
          searchPlaceholder: '搜索姓名/邮箱',
          filters: [
            {
              key: 'status',
              label: '状态',
              options: statusOptions,
              itemClass: 'w-full sm:w-auto sm:min-w-[200px] sm:max-w-[280px]',
              itemStyle: { borderRadius: '8px' }
            },
            { key: 'role', label: '角色', options: roleOptions }
          ],
          searchClassName: 'w-full sm:w-auto sm:min-w-[300px]',
          className: 'bg-gray-50 dark:bg-gray-800/50',
          style: { padding: '12px 16px' }
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
        @page-change="handlePageChange" />
    </DemoBlock>

    <DemoBlock
      title="完全自定义工具栏"
      description="#toolbar 插槽完全替换内置工具栏区域（含 role='toolbar' 容器），通过 context 获取搜索/筛选/选择等状态和操作。使用时请自行添加 role='toolbar' 以保持可访问性。"
      :code="customToolbarSnippet">
      <DataTableWithToolbar
        :columns="columns"
        :dataSource="pagedData"
        table-layout="fixed"
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
        @filters-change="handleFiltersChange"
        @page-change="handlePageChange">
        <template #toolbar="{ searchValue, setSearch, submitSearch, filters, setFilter }">
          <div
            role="toolbar"
            aria-label="自定义工具栏"
            class="flex flex-wrap items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-center gap-2">
              <input
                class="rounded border border-blue-300 px-3 py-1.5 text-sm dark:border-blue-600 dark:bg-gray-900"
                :value="searchValue"
                placeholder="自定义搜索"
                @input="(e) => setSearch((e.target as HTMLInputElement).value)" />
              <button
                class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                @click="submitSearch">
                搜索
              </button>
            </div>
            <span class="text-sm text-gray-500">状态: {{ filters.status ?? '全部' }}</span>
          </div>
        </template>
      </DataTableWithToolbar>
    </DemoBlock>

    <DemoBlock
      title="卡片自定义渲染"
      description="通过 #card 插槽完全自定义卡片内容（优先于 renderCard prop），或使用 cardClassName 添加卡片容器样式。缩窄窗口到 lg/1024px 以下可预览。"
      :code="cardSlotSnippet">
      <DataTableWithToolbar
        :columns="cardColumns"
        :dataSource="pagedData"
        responsive-mode="card"
        card-breakpoint="lg"
        card-class-name="shadow-lg rounded-xl"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showTotal: true
        }"
        @page-change="handlePageChange">
        <template #card="{ record }">
          <div class="p-4">
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
              {{ (record as UserRow).name }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ (record as UserRow).email }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                :class="
                  (record as UserRow).status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                ">
                {{ (record as UserRow).status === 'active' ? '启用' : '禁用' }}
              </span>
              <span class="text-xs text-gray-400">{{ (record as UserRow).role }}</span>
            </div>
          </div>
        </template>
      </DataTableWithToolbar>
    </DemoBlock>
  </div>
</template>
