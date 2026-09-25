<script setup lang="ts">
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const value = ref('0 9 * * 1-5')
</script>

<template>
  <FormItem label="执行计划">
    <CronEditor v-model="value" />
  </FormItem>
</template>
