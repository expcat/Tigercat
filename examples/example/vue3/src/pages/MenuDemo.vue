<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// MenuDemo — menu/04 is Vue-only; React parity is slice 3
const modules = getDemoModules('menu')
</script>

<template>
  <DemoPage title="Menu 菜单" description="为页面和功能提供导航的菜单列表。" :modules="modules" />
</template>
