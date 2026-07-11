<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Drawer } from '@expcat/tigercat-vue/Drawer'

const open = ref(false)
const event = ref('尚未打开')
</script>

<template>
  <div class="space-y-3">
    <Button @click="open = true">观察生命周期</Button>
    <p class="text-sm text-gray-500" role="status">{{ event }}</p>
    <Drawer
      v-model:open="open"
      title="生命周期抽屉"
      destroy-on-close
      defer-destroy-on-close
      @after-enter="event = '打开动画已完成'"
      @after-close="event = '关闭动画已完成'">
      <p>关闭后内容会在动画结束时销毁。</p>
    </Drawer>
  </div>
</template>
