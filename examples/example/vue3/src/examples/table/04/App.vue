<script setup lang="ts">
import { ref } from 'vue'
import { Table } from '@expcat/tigercat-vue/Table'
import type { TableColumn } from '@expcat/tigercat-vue'

const columns: TableColumn[] = [
  { key: 'name', title: '姓名' },
  { key: 'department', title: '部门' }
]

const rows = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: '成员 ' + (index + 1),
  department: index % 2 === 0 ? '研发部' : '产品部'
}))

const selectedRowKeys = ref<(string | number)[]>([])
const page = ref({ current: 1, pageSize: 5 })
</script>

<template>
  <Table
    :columns="columns"
    :data-source="rows"
    :row-selection="{ selectedRowKeys }"
    :pagination="{ ...page, total: rows.length, showSizeChanger: false }"
    @selection-change="selectedRowKeys = $event"
    @page-change="page = $event" />
</template>
