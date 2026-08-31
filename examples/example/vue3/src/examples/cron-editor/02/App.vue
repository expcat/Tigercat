<script setup lang="ts">
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'

const six = ref('0 0 0 * * *')
const custom = ref('* * * * *')
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        6 段表达式保持原样，五列禁用，不会被改写成每分钟。
      </p>
      <CronEditor v-model="six" :presets="[]" />
    </div>
    <div class="space-y-2">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        从 Any 切到 Custom 后可以输入 1,15,30。不认 MON / Quartz。
      </p>
      <CronEditor v-model="custom" :presets="[]" />
    </div>
  </div>
</template>
