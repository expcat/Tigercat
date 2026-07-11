<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// StepperDemo
const modules = getDemoModules('stepper')
</script>

<template>
  <DemoPage
    title="Stepper 步进器"
    description="数值增减控制器，支持步长、范围和精度。"
    :modules="modules" />
</template>
