<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Modal } from '@expcat/tigercat-vue/Modal'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">打开对话框</Button>
  <Modal
    v-model:open="open"
    title="基本对话框"
    size="md"
    centered
    show-default-footer
    ok-text="知道了">
    <p>一个受控实例复合展示尺寸、居中、遮罩和默认页脚。</p>
  </Modal>
</template>
