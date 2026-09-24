<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { confirmModal } from '@expcat/tigercat-vue/Modal'

const result = ref('尚未确认')

async function ask() {
  try {
    await confirmModal({
      title: '删除这项？',
      content: '删除后不能恢复。',
      onOk: () => Promise.resolve('deleted')
    })
    result.value = '已确认'
  } catch {
    result.value = '已取消'
  }
}
</script>

<template>
  <ConfigProvider>
    <Button @click="ask">确认删除</Button>
    <p>{{ result }}</p>
  </ConfigProvider>
</template>
