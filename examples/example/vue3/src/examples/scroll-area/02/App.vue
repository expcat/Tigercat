<script setup lang="ts">
import { ScrollArea } from '@expcat/tigercat-vue/ScrollArea'

const rows = Array.from({ length: 12 }, (_, row) => ({
  key: `第 ${row + 1} 行`,
  cells: Array.from({ length: 10 }, (_, col) => `R${row + 1}C${col + 1}`)
}))
</script>

<template>
  <div class="w-full max-w-md">
    <ScrollArea
      direction="both"
      scrollbar="always"
      scrollbar-size="lg"
      :max-height="200"
      aria-label="双向滚动表格"
      class="rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="text-sm text-gray-700 dark:text-gray-200">
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <th class="whitespace-nowrap px-3 py-2 text-left font-medium">{{ row.key }}</th>
            <td v-for="cell in row.cells" :key="cell" class="whitespace-nowrap px-3 py-2">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </ScrollArea>
  </div>
</template>
