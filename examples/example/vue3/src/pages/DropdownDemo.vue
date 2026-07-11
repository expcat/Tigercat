<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DropdownDemo
const modules = getDemoModules('dropdown')
</script>

<template>
  <DemoPage title="Dropdown 下拉菜单" description="向下弹出的列表菜单。" :modules="modules" />
</template>
