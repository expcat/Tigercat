<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked" size="lg">接收更新通知</Checkbox>
</template>
