<script setup lang="ts">
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  status: string
}

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', status: '在岗' },
  { id: 2, name: '李娜', status: '休假' }
]
</script>

<template>
  <DataTableWithToolbar
    :columns="columns"
    :data-source="rows"
    :pagination="false"
    :row-selection="{ type: 'checkbox' }"
    :toolbar="{ searchPlaceholder: '搜索', showColumnSettings: true }">
    <template #filters-extra="{ dataSource, selectedKeys, hiddenColumnKeys }">
      <DataExport
        :columns="columns"
        :data-source="
          selectedKeys.length
            ? dataSource.filter((row) => selectedKeys.includes(row.id as number))
            : dataSource
        "
        :hidden-column-keys="hiddenColumnKeys"
        file-name="成员列表" />
    </template>
  </DataTableWithToolbar>
</template>
