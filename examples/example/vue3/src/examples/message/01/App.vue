<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Message } from '@expcat/tigercat-vue'

const showMessages = () => {
  Message.success('保存成功')
  Message.info('已写入草稿箱')
}
</script>

<template>
  <Button variant="primary" @click="showMessages">连续显示两条</Button>
</template>
