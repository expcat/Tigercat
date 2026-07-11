<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TransferDemo
const modules = getDemoModules('transfer')
</script>

<template>
  <DemoPage
    title="Transfer 穿梭框"
    description="双栏穿梭选择，将数据在两栏之间移动。"
    :modules="modules" />
</template>
