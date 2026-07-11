<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SpaceDemo
const modules = getDemoModules('space')
</script>

<template>
  <DemoPage title="Space 间距" description="设置组件之间的间距。" :modules="modules" />
</template>
