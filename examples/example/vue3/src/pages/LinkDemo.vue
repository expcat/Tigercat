<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// LinkDemo
const modules = getDemoModules('link')
</script>

<template>
  <DemoPage title="Link 链接" description="文字超链接。" :modules="modules" />
</template>
