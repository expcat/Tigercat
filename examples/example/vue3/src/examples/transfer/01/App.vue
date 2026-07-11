<script setup lang="ts">
import { ref } from 'vue'
import { Transfer } from '@expcat/tigercat-vue/Transfer'

const targetKeys = ref<(string | number)[]>(['frontend'])
const dataSource = [
  { key: 'design', label: '设计' },
  { key: 'frontend', label: '前端' },
  { key: 'backend', label: '后端' },
  { key: 'qa', label: '测试' }
]
</script>

<template>
  <Transfer
    v-model:target-keys="targetKeys"
    :data-source="dataSource"
    searchable
    source-title="可选团队"
    target-title="已选团队"
    class="max-w-2xl" />
</template>
