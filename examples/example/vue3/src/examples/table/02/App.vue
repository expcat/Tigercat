<script setup lang="ts">
import { ref } from 'vue'
import { Table } from '@expcat/tigercat-vue/Table'
import type { SortState, TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名', sortable: true, filter: { type: 'text' } },
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

const sort = ref<SortState>({ key: 'name', direction: 'asc' })
const filters = ref<Record<string, unknown>>({ status: 'active' })
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    row-key="id"
    :sort="sort"
    :filters="filters"
    :pagination="false"
    @sort-change="sort = $event"
    @filter-change="filters = $event" />
</template>
