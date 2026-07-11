<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import { type TableColumn, type TableToolbarFilterValue } from '@expcat/tigercat-vue'
import type { TableToolbarAction, TableCardLayoutItem } from '@expcat/tigercat-core'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
  email: string
  age: number
}

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
const exportSelectedKeys = ref<(string | number)[]>([])
const exportHiddenKeys = ref<string[]>([])
const exportRows = seedData.slice(0, 8)
const exportColumns = computed(() =>
  columns.filter((column) => !exportHiddenKeys.value.includes(column.key))
)
const exportDataSource = computed(() =>
  exportSelectedKeys.value.length > 0
    ? exportRows.filter((row) => exportSelectedKeys.value.includes(row.id as number))
    : exportRows
)

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
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-8">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">搜索/筛选/批量操作 + 分页联动。</p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义过滤器</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          filters-extra 插槽可把年龄段等复合控件放入工具栏，并通过 setFilter 发出对象型过滤值。
        </p>
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
              <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                年龄段
              </span>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">列设置</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          开启 showColumnSettings 后，工具栏右侧出现列设置入口；hideable: false 的列不可隐藏。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">钉列 / 锁定列</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          column.fixed 让列在横向滚动时钉在边缘；开启 column-lockable 后表头出现锁定按钮。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">卡片模式字段定制</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          窄屏自动切换为卡片：姓名作为标题、ID 隐藏、状态/角色按 cardPriority 排序。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义卡片网格布局</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          使用 cardGrid 列属性或 cardLayout 集中配置，实现双列/三列混排的卡片网格布局。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">工具栏布局定制</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          通过 itemClass/itemStyle 定制单个 filter 容器宽度，searchClassName 定制搜索框尺寸。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">完全自定义工具栏</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          #toolbar 插槽完全替换内置工具栏区域，通过 context 获取搜索/筛选/选择等状态和操作。
        </p>
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
          <template #toolbar="{ searchValue, setSearch, submitSearch, filters }">
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">卡片自定义渲染</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          通过 #card 插槽完全自定义卡片内容，或使用 cardClassName 添加卡片容器样式。
        </p>
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
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          集成导出（DataExport）
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          把 DataExport 放进 #filters-extra
          插槽，实现“所见即所导”：导出列跟随列设置的隐藏状态；有选中行时仅导出选中行，否则导出全部数据。
        </p>
        <DataTableWithToolbar
          :columns="columns"
          :dataSource="exportRows"
          table-layout="fixed"
          :rowSelection="{ selectedRowKeys: exportSelectedKeys, type: 'checkbox' }"
          v-model:hidden-column-keys="exportHiddenKeys"
          :toolbar="{ showColumnSettings: true, selectedKeys: exportSelectedKeys }"
          :pagination="false"
          @selection-change="(keys: (string | number)[]) => (exportSelectedKeys = keys)">
          <template #filters-extra>
            <DataExport
              :columns="exportColumns"
              :data-source="exportDataSource"
              file-name="用户列表" />
          </template>
        </DataTableWithToolbar>
      </section>
    </div>
  </div>
</template>
