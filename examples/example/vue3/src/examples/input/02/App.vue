<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'

const value = ref('可清除的内容')
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <Input v-model="value" clearable placeholder="输入后显示清除按钮" />
  </div>
</template>
