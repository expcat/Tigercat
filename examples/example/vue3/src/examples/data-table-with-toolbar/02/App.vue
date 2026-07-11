<script setup lang="ts">
import { computed, ref } from 'vue'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import type { TableColumn, TableToolbarFilterValue } from '@expcat/tigercat-vue'

interface Row extends Record<string, unknown> {
  id: number
  name: string
  score: number
}

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'name', title: '成员' },
  { key: 'score', title: '积分', width: 100 }
]

const rows: Row[] = [
  { id: 1, name: '张伟', score: 92 },
  { id: 2, name: '李娜', score: 78 },
  { id: 3, name: '王强', score: 65 }
]

const filters = ref<Record<string, TableToolbarFilterValue>>({ minimumScore: null })
const minimumScore = computed(() =>
  typeof filters.value.minimumScore === 'number' ? filters.value.minimumScore : 0
)
const dataSource = computed(() => rows.filter((row) => row.score >= minimumScore.value))

const setMinimumScore = (
  setFilter: (key: string, value: TableToolbarFilterValue) => void,
  event: Event
) => {
  const value = (event.target as HTMLInputElement).value
  setFilter('minimumScore', value ? Number(value) : null)
}
</script>

<template>
  <DataTableWithToolbar
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    @filters-change="filters = $event">
    <template #filters-extra="{ filters: currentFilters, setFilter }">
      <input
        type="number"
        aria-label="最低积分"
        class="w-28 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600"
        :value="typeof currentFilters.minimumScore === 'number' ? currentFilters.minimumScore : ''"
        placeholder="最低积分"
        @input="setMinimumScore(setFilter, $event)" />
    </template>
  </DataTableWithToolbar>
</template>
