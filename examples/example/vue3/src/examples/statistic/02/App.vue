<script setup lang="ts">
import { Statistic } from '@expcat/tigercat-vue/Statistic'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end gap-8">
      <Statistic
        v-for="size in sizes"
        :key="size"
        :title="`size=${size}`"
        :value="12345"
        :size="size"
        :group-separator="true" />
    </div>
    <div class="flex flex-wrap gap-8">
      <Statistic title="groupSeparator" :value="1234567" :group-separator="true" />
      <Statistic title="无分隔符" :value="1234567" />
    </div>
  </div>
</template>
