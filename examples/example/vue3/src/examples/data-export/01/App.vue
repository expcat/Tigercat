<script setup lang="ts">
import { ref } from 'vue'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import type { TableColumn } from '@expcat/tigercat-vue'
import type { DataExportFormat } from '@expcat/tigercat-core'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' }
]

const rows = [
  { id: 1, name: '张伟', status: 'active' },
  { id: 2, name: '李娜', status: 'disabled' }
]

const lastExport = ref('')
const formatCell = (value: unknown, column: TableColumn) =>
  column.key === 'status' ? (value === 'active' ? '在职' : '离职') : value
const handleExport = (format: DataExportFormat) => {
  lastExport.value = format
}
</script>

<template>
  <div class="flex items-center gap-3">
    <DataExport
      :columns="columns"
      :data-source="rows"
      file-name="员工名单"
      sheet-name="员工"
      :cell-formatter="formatCell"
      @export="handleExport" />
    <span v-if="lastExport" class="text-sm text-gray-500">最近导出：{{ lastExport }}</span>
  </div>
</template>
