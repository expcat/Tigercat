<script setup lang="ts">
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  email: string
  role: string
}

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名', width: 160, fixed: 'left', hideable: false },
  { key: 'email', title: '邮箱', width: 220 },
  { key: 'role', title: '角色', width: 140 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', email: 'zhang@example.com', role: '管理员' },
  { id: 2, name: '李娜', email: 'li@example.com', role: '编辑' }
]
</script>

<template>
  <DataTableWithToolbar
    :columns="columns"
    :data-source="rows"
    column-lockable
    :default-hidden-column-keys="['email']"
    :toolbar="{
      showColumnSettings: true,
      columnSettings: { lockedColumnKeys: ['name'] }
    }"
    :pagination="false" />
</template>
