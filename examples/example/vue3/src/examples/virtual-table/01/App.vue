<script setup lang="ts">
import { ref } from 'vue'
import { VirtualTable } from '@expcat/tigercat-vue/VirtualTable'
import { type TableColumn } from '@expcat/tigercat-vue'

const selectedRowKeys = ref<(string | number)[]>([2, 4])

const basicColumns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

const fixedColumns: TableColumn[] = [
  {
    key: 'id',
    title: 'ID',
    width: 96,
    fixed: 'left',
    fixedHeaderClassName:
      'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)]'
  },
  { key: 'name', title: '姓名', width: 180 },
  { key: 'email', title: '邮箱', width: 240 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    fixed: 'right',
    fixedHeaderClassName:
      'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)]'
  }
]

const basicData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '忙碌'
}))
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">1000 行数据，virtualItemHeight=48</p>
        <VirtualTable
          :data-source="basicData"
          :columns="basicColumns"
          :virtual-height="400"
          :virtual-item-height="48" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">斑马纹 & 边框</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">striped + bordered</p>
        <VirtualTable
          :data-source="basicData"
          :columns="basicColumns"
          :virtual-height="300"
          striped
          bordered />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">固定列样式自定义</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          固定列支持 fixedClassName / fixedHeaderClassName，可根据 selected 状态自定义 sticky
          单元格外观。
        </p>
        <VirtualTable
          :data-source="basicData.slice(0, 24)"
          :columns="fixedColumns"
          row-key="id"
          :virtual-height="280"
          :virtual-item-height="48"
          striped
          :row-selection="{ selectedRowKeys }"
          @selection-change="selectedRowKeys = $event" />
        <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
          已选择业务 ID：{{ selectedRowKeys.join(', ') || '无' }}
        </p>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">加载 & 空状态</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">loading 和 emptyText</p>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm text-gray-500 mb-2">Loading</p>
            <VirtualTable :data-source="[]" :columns="basicColumns" :virtual-height="200" loading />
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">Empty</p>
            <VirtualTable
              :data-source="[]"
              :columns="basicColumns"
              :virtual-height="200"
              empty-text="暂无数据" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
