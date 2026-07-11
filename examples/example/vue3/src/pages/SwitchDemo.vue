<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SwitchDemo
const modules = getDemoModules('switch')
</script>

<template>
  <DemoPage
    title="Switch 开关"
    description="表示两种相互对立的状态间的切换，多用于触发「开/关」。"
    :modules="modules" />
</template>
