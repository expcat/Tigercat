<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Modal } from '@expcat/tigercat-vue/Modal'

const outerOpen = ref(false)
const innerOpen = ref(false)
</script>

<template>
  <Button @click="outerOpen = true">打开父对话框</Button>
  <Modal v-model:open="outerOpen" title="父对话框">
    <Button @click="innerOpen = true">继续确认</Button>
    <template #footer>
      <Button variant="secondary" @click="outerOpen = false">关闭</Button>
    </template>
    <Modal v-model:open="innerOpen" title="嵌套确认" size="sm" :z-index="1100" show-default-footer>
      <p>嵌套 Modal 是双实例的唯一例外。</p>
    </Modal>
  </Modal>
</template>
