<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// NumberKeyboardDemo
const modules = getDemoModules('number-keyboard')
</script>

<template>
  <DemoPage
    title="NumberKeyboard 数字键盘"
    description="移动端数字键盘，支持金额、手机号和身份证输入模式。"
    :modules="modules" />
</template>
