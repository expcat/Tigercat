<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { Input } from '@expcat/tigercat-vue/Input'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">编辑筛选条件</Button>
  <Drawer v-model:open="open" size="sm">
    <template #header>
      <div>
        <strong>筛选设置</strong>
        <p class="text-xs text-gray-500">自定义头部说明</p>
      </div>
    </template>
    <label class="space-y-1 text-sm">
      <span>关键词</span>
      <Input placeholder="输入关键词" />
    </label>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="open = false">取消</Button>
        <Button @click="open = false">应用</Button>
      </div>
    </template>
  </Drawer>
</template>
