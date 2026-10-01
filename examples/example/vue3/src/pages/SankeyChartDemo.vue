<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('sankey-chart')
</script>

<template>
  <DemoPage title="SankeyChart 桑基图" description="用节点与流量带展示流向。" :modules="modules" />
</template>
