<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'

const open = ref(false)
</script>

<template>
  <Tooltip v-model:open="open" trigger="manual" content="这是受控提示" placement="right">
    <Button @click="open = !open">{{ open ? '隐藏提示' : '显示提示' }}</Button>
  </Tooltip>
</template>
