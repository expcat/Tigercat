<script setup lang="ts">
import { WaterfallChart } from '@expcat/tigercat-vue/WaterfallChart'
import type { WaterfallDatum } from '@expcat/tigercat-core'

const data: WaterfallDatum[] = [
  { label: '期初', value: 120, kind: 'total' },
  { label: '新增', value: 40, kind: 'increase' },
  { label: '减少', value: 25, kind: 'decrease' },
  { label: '期末', value: 135, kind: 'total' }
]
</script>

<template>
  <WaterfallChart :data="data" :width="480" :height="280" :responsive="false" />
</template>
