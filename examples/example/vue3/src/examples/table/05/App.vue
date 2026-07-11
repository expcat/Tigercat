<script setup lang="ts">
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', hideInCard: true },
  { key: 'name', title: '姓名', cardTitle: true },
  { key: 'status', title: '状态', cardPriority: 1 },
  { key: 'email', title: '邮箱', cardPriority: 2 }
]

const rows = [
  { id: 1, name: '张伟', status: '在线', email: 'zhang@example.com' },
  { id: 2, name: '李娜', status: '离线', email: 'li@example.com' }
]
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    responsive-mode="card"
    card-breakpoint="lg"
    card-field-gap="gap-2"
    :pagination="false" />
</template>
