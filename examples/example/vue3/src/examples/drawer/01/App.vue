<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Drawer } from '@expcat/tigercat-vue/Drawer'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">打开抽屉</Button>
  <Drawer v-model:open="open" title="基本抽屉" placement="right" size="md">
    <p>一个受控实例复合展示位置、尺寸、遮罩和默认关闭行为。</p>
    <template #footer>
      <Button size="sm" @click="open = false">关闭</Button>
    </template>
  </Drawer>
</template>
