<script setup lang="ts">
import { SankeyChart } from '@expcat/tigercat-vue/SankeyChart'
import type { SankeyLink, SankeyNode } from '@expcat/tigercat-core'

const nodes: SankeyNode[] = [
  { id: 'source', label: '来源' },
  { id: 'left', label: '左支' },
  { id: 'right', label: '右支' }
]
const links: SankeyLink[] = [
  { source: 'source', target: 'left', value: 8 },
  { source: 'source', target: 'right', value: 5 }
]
</script>

<template>
  <SankeyChart :nodes="nodes" :links="links" :width="480" :height="280" :responsive="false" />
</template>
