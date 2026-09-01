<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { notification } from '@expcat/tigercat-vue'

const showNotifications = () => {
  notification.success({
    title: '保存成功',
    description: '个人资料已更新。'
  })
  notification.info({
    title: '同步完成',
    description: '草稿已上传到云端。'
  })
}
</script>

<template>
  <Button variant="primary" @click="showNotifications">连续显示两条</Button>
</template>
