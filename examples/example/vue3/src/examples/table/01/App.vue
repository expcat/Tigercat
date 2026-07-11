<script setup lang="ts">
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名', width: 160 },
  { key: 'role', title: '角色' }
]

const rows = [
  { id: 1, name: '张伟', role: '产品经理' },
  { id: 2, name: '李娜', role: '前端工程师' },
  { id: 3, name: '王强', role: '设计师' }
]
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    bordered
    striped
    size="sm"
    table-layout="fixed"
    :pagination="false" />
</template>
