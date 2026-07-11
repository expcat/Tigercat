<script setup lang="ts">
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  {
    key: 'name',
    title: '姓名',
    sortable: true,
    filter: { type: 'text', placeholder: '搜索姓名...' }
  },
  { key: 'age', title: '年龄', sortable: true, width: 100 },
  {
    key: 'status',
    title: '状态',
    filter: {
      type: 'select',
      options: [
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '停用' }
      ]
    }
  }
]

const rows = [
  { id: 1, name: '张伟', age: 32, status: 'active' },
  { id: 2, name: '李娜', age: 28, status: 'inactive' },
  { id: 3, name: '王强', age: 41, status: 'active' }
]
</script>

<template>
  <Table :columns="columns" :data-source="rows" :pagination="false" />
</template>
