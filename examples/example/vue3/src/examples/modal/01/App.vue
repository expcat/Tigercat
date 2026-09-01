<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Modal } from '@expcat/tigercat-vue/Modal'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">打开对话框</Button>
  <Modal v-model:open="open" title="基本对话框">
    <p>受控打开。默认没有居中、没有默认页脚。</p>
  </Modal>
</template>
