<script setup lang="ts">
import { ref } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TableColumn } from '@expcat/tigercat-vue'
import type { DataExportFormat } from '@expcat/tigercat-core'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  hiredAt: Date
  secret: string
}

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'hiredAt', title: '到職日', dataKey: 'hiredAt' },
  { key: 'secret', title: '內部備註' },
  { key: 'actions', title: '操作', render: () => '編輯' }
]

const rows: Row[] = [
  { id: 1, name: '張偉', hiredAt: new Date('2024-03-01T00:00:00.000Z'), secret: 'hidden' },
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
  <ConfigProvider :locale="zhTW">
    <div class="space-y-6">
      <section class="space-y-2">
        <p class="text-sm text-gray-500">
          預設 formats 是 Excel + Markdown 下拉。操作列沒有 dataKey，不會寫進檔案；hiddenColumnKeys
          會跳過內部備註。
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <DataExport
            :columns="columns"
            :data-source="rows"
            file-name="report.xlsx"
            sheet-name="員工"
            :hidden-column-keys="hiddenColumnKeys"
            @export="handleExport"
            @error="handleError" />
          <span v-if="lastExport" class="text-sm text-gray-500">最近匯出：{{ lastExport }}</span>
          <span v-if="error" class="text-sm text-red-600" role="status">{{ error }}</span>
        </div>
      </section>
      <section class="space-y-2">
        <p class="text-sm text-gray-500">單一格式是一顆按鈕；disabled 不會觸發下載。</p>
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
  </ConfigProvider>
</template>
