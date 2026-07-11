<script setup lang="ts">
import { ref } from 'vue'
import { Transfer } from '@expcat/tigercat-vue/Transfer'

const targetKeys1 = ref<(string | number)[]>(['3', '4'])
const targetKeys2 = ref<(string | number)[]>(['3', '4'])
const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `内容 ${i + 1}`,
  description: `描述 ${i + 1}`
}))
</script>

<template>
  <div class="min-w-0">
    <Transfer
      v-model="targetKeys2"
      :data-source="dataSource"
      searchable
      source-title="可选"
      target-title="已选" />
  </div>
</template>
