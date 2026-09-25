<script setup lang="ts">
import { ref } from 'vue'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import type { TableColumn } from '@expcat/tigercat-core'
import type { DataExportFormat } from '@expcat/tigercat-core'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  hiredAt: Date
  secret: string
}

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'hiredAt', title: '到职日', dataKey: 'hiredAt' },
  { key: 'secret', title: '内部备注' },
  { key: 'actions', title: '操作', render: () => '编辑' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', hiredAt: new Date('2024-03-01T00:00:00.000Z'), secret: 'hidden' },
  { id: 2, name: '李娜', hiredAt: new Date('2025-08-12T00:00:00.000Z'), secret: 'hidden' }
]

const lastExport = ref('')
const error = ref('')
const hiddenColumnKeys = ['secret']

const handleExport = (format: DataExportFormat) => {
  error.value = ''
  lastExport.value = format
}
const handleError = () => {
  error.value = 'failed'
}
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-2">
      <p class="text-sm text-gray-500">
        默认 formats 是 Excel + Markdown 下拉。操作列没有 dataKey，不会写进文件；hiddenColumnKeys
        会跳过内部备注。
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <DataExport
          :columns="columns"
          :data-source="rows"
          file-name="report.xlsx"
          sheet-name="员工"
          :hidden-column-keys="hiddenColumnKeys"
          @export="handleExport"
          @error="handleError" />
        <span v-if="lastExport" class="text-sm text-gray-500">最近导出：{{ lastExport }}</span>
        <span v-if="error" class="text-sm text-red-600" role="status">{{ error }}</span>
      </div>
    </section>
    <section class="space-y-2">
      <p class="text-sm text-gray-500">单一格式是一颗按钮；disabled 不会触发下载。</p>
      <div class="flex flex-wrap items-center gap-3">
        <DataExport
          :columns="columns"
          :data-source="rows"
          :formats="['xlsx']"
          file-name="report.xlsx"
          :hidden-column-keys="hiddenColumnKeys"
          @export="handleExport" />
        <DataExport
          :columns="columns"
          :data-source="rows"
          :formats="['csv']"
          file-name="report.csv"
          :hidden-column-keys="hiddenColumnKeys"
          disabled />
      </div>
    </section>
  </div>
</template>
