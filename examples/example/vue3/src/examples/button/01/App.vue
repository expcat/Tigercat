<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const SaveLabel = defineComponent({ setup: () => () => h('span', '保存') })
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
    <Button><SaveLabel /></Button>
    <Button size="sm">小号</Button>
    <Button disabled>禁用</Button>
    <Button danger>删除</Button>
    <Button>
      <template #icon><span aria-hidden="true">★</span></template>
      收藏
    </Button>
    <Button icon-position="end">
      <template #icon><span aria-hidden="true">★</span></template>
      后缀图标
    </Button>
    <Button aria-label="收藏">
      <template #icon><span>★</span></template>
    </Button>
    <Button loading>提交中</Button>
  </div>
</template>
