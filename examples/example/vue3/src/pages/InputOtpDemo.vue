<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input-otp')
</script>

<template>
  <DemoPage
    title="InputOTP 验证码输入"
    description="分格输入一次性验证码/PIN，支持粘贴分发、自动聚焦推进与掩码模式。"
    :modules="modules" />
</template>
