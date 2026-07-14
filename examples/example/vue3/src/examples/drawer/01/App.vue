<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { Select } from '@expcat/tigercat-vue/Select'

const open = ref(false)
const assignee = ref('alice')
</script>

<template>
  <Button @click="open = true">打开抽屉</Button>
  <Drawer v-model:open="open" title="基本抽屉" placement="right" size="md">
    <div class="space-y-4">
      <p>一个受控实例复合展示位置、尺寸、遮罩和默认关闭行为。</p>
      <label class="block space-y-1 text-sm">
        <span>负责人（浮层自动使用 Drawer layer）</span>
        <Select
          v-model="assignee"
          :options="[
            { label: 'Alice', value: 'alice' },
            { label: 'Bob', value: 'bob' }
          ]" />
      </label>
    </div>
    <template #footer>
      <Button size="sm" @click="open = false">关闭</Button>
    </template>
  </Drawer>
</template>
