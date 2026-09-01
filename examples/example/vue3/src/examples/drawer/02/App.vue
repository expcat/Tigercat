<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { Input } from '@expcat/tigercat-vue/Input'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">从底部打开</Button>
  <Drawer v-model:open="open" placement="bottom" :mask="false" title="筛选条件">
    <div class="space-y-3">
      <p>mask=false 时空区点得透。内容可滚，下滑不会误关。</p>
      <label class="space-y-1 text-sm">
        <span>关键词</span>
        <Input placeholder="输入关键词" />
      </label>
      <p v-for="index in 8" :key="index">滚动条目 {{ index }}</p>
    </div>
    <template #footer>
      <Button size="sm" @click="open = false">应用</Button>
    </template>
  </Drawer>
</template>
