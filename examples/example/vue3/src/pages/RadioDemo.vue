<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// RadioDemo
const modules = getDemoModules('radio')
</script>

<template>
  <DemoPage title="Radio 单选框" description="在一组备选项中进行单选。" :modules="modules" />
</template>
