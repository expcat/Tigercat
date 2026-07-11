<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Popconfirm } from '@expcat/tigercat-vue/Popconfirm'

const open = ref(false)
</script>

<template>
  <Popconfirm
    v-model:open="open"
    title="提交当前表单？"
    placement="right"
    ok-text="提交"
    @confirm="open = false">
    <Button>{{ open ? '确认框已打开' : '受控确认框' }}</Button>
  </Popconfirm>
</template>
