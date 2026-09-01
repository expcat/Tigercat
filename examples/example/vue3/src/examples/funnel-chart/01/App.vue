<script setup lang="ts">
import { FunnelChart } from '@expcat/tigercat-vue/FunnelChart'

const data = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 },
  { label: '复购', value: 300 }
]
</script>

<template>
  <FunnelChart :data="data" :width="360" :height="300" />
</template>
