<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TourDemo
const modules = getDemoModules('tour')
</script>

<template>
  <DemoPage title="Tour 漫游式引导" description="分步引导用户了解页面功能。" :modules="modules" />
</template>
