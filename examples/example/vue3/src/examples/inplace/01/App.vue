<script setup lang="ts">
import { ref } from 'vue'
import { Inplace } from '@expcat/tigercat-vue/Inplace'

const editing = ref(false)
const value = ref('行内标题')
</script>

<template>
  <Inplace v-model:editing="editing">
    <template #display>{{ value }}</template>
    <template #input>
      <input v-model="value" aria-label="编辑标题" />
    </template>
  </Inplace>
</template>
