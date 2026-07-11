<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked" :indeterminate="!checked">全选（当前为部分选择）</Checkbox>
</template>
