<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const june = new Date(2024, 5, 15)
const august = new Date(2024, 7, 20)
const date = ref<Date | null>(june)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="mb-2 text-sm text-[var(--tiger-text-muted)]">不绑 v-model，点格子会留下选中</p>
      <Calendar :default-value="june" :now="june" />
    </div>
    <div>
      <p class="mb-2 text-sm text-[var(--tiger-text-muted)]">受控：父级把选中改到另一月</p>
      <button type="button" class="mb-2 rounded border px-2 py-1 text-sm" @click="date = august">
        跳到 8 月
      </button>
      <Calendar v-model="date" :now="june" />
      <p class="mt-2 text-sm text-[var(--tiger-text-muted)]">
        选中日期：{{ date?.toLocaleDateString() ?? '无' }}
      </p>
    </div>
  </div>
</template>
