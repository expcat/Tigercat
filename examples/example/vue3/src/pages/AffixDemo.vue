<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AffixDemo
const modules = getDemoModules('affix')
</script>

<template>
  <DemoPage title="Affix 固钉" description="将元素固定在可视区域的指定位置。" :modules="modules" />
</template>
