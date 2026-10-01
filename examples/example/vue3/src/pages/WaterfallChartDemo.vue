<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('waterfall-chart')
</script>

<template>
  <DemoPage title="WaterfallChart 瀑布图" description="展示增减变化及合计值。" :modules="modules" />
</template>
