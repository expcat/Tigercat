<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import type { TableColumn } from '@expcat/tigercat-vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  role: string
}

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' }
]

const rows: Row[] = [
  { id: 1, name: '张伟', role: '管理员' },
  { id: 2, name: '李娜', role: '编辑' },
  { id: 3, name: '王强', role: '访客' }
]

const keyword = ref('')
const dataSource = computed(() => rows.filter((row) => row.name.includes(keyword.value.trim())))
</script>

<template>
  <DataTableWithToolbar
    :columns="columns"
    :data-source="dataSource"
    :toolbar="{ searchValue: keyword }"
    :pagination="false"
    @search-change="keyword = $event">
    <template #toolbar="{ searchValue, setSearch }">
      <div
        role="toolbar"
        aria-label="成员筛选"
        class="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
        <input
          class="min-w-0 flex-1 rounded border border-blue-200 bg-white px-3 py-1.5 text-sm dark:border-blue-800 dark:bg-gray-900"
          :value="searchValue"
          placeholder="筛选成员"
          @input="setSearch(($event.target as HTMLInputElement).value)" />
        <button
          type="button"
          class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
          @click="setSearch('')">
          清空
        </button>
      </div>
    </template>
  </DataTableWithToolbar>
</template>
