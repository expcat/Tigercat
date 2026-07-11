<script setup lang="ts">
import { ref } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { Button } from '@expcat/tigercat-vue/Button'

const visible = ref(true)
</script>

<template>
  <Alert
    v-if="visible"
    type="success"
    title="配置已保存"
    description="点击关闭按钮隐藏提示。"
    closable
    close-aria-label="关闭保存提示"
    @close="visible = false" />
  <Button v-else size="sm" @click="visible = true">重新显示</Button>
</template>
