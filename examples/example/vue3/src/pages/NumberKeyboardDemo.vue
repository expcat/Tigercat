<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// NumberKeyboardDemo
const modules = getDemoModules('number-keyboard')
</script>

<template>
  <DemoPage
    title="NumberKeyboard 数字键盘"
    description="与 Input 一起用。amount / phone / id-card 三种模式；open 时走 overlay 底栏。"
    :modules="modules" />
</template>
