<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// IconDemo
const modules = getDemoModules('icon')
</script>

<template>
  <DemoPage title="Icon 图标" description="语义化的矢量图形。" :modules="modules" />
</template>
