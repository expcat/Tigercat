<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Input } from '@expcat/tigercat-vue/Input'
import { Modal } from '@expcat/tigercat-vue/Modal'

const open = ref(false)
const closedCount = ref(0)
</script>

<template>
  <div class="space-y-3">
    <Button @click="open = true">打开临时表单</Button>
    <p class="text-sm text-gray-500" role="status">已完成关闭：{{ closedCount }} 次</p>
    <Modal
      v-model:open="open"
      title="临时表单"
      destroy-on-close
      show-default-footer
      @after-close="closedCount += 1">
      <label class="space-y-1 text-sm">
        <span>备注</span>
        <Input placeholder="关闭后销毁此内容" />
      </label>
    </Modal>
  </div>
</template>
