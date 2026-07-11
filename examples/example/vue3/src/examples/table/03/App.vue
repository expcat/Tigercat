<script setup lang="ts">
import { h } from 'vue'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  {
    key: 'status',
    title: '状态',
    render: (record) => {
      const active = record.status === 'active'
      return h(
        'span',
        {
          class: active
            ? 'rounded bg-green-50 px-2 py-1 text-green-700'
            : 'rounded bg-gray-100 px-2 py-1 text-gray-600'
        },
        active ? '启用' : '停用'
      )
    }
  }
]

const rows = [
  { id: 1, name: '张伟', status: 'active' },
  { id: 2, name: '李娜', status: 'inactive' }
]
</script>

<template>
  <Table :columns="columns" :data-source="rows" :pagination="false" />
</template>
