<script setup lang="ts">
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'

const value = ref('0 9 * * 1-5')
</script>

<template>
  <CronEditor v-model="value" aria-label="编辑执行计划" />
</template>
