<script setup lang="ts">
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
</script>

<template>
  <div class="flex flex-col gap-6">
    <FormItem label="日期" class="w-full max-w-[280px]">
      <DatePicker />
    </FormItem>
    <p class="text-sm text-[var(--tiger-text-secondary)]">上面不绑 v-model，点格子仍会改显示。</p>
  </div>
</template>
