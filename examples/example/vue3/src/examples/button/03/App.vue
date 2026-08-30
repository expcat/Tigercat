<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { ButtonGroup } from '@expcat/tigercat-vue/ButtonGroup'
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap">
    <ButtonGroup size="sm" aria-label="分页">
      <Button>上一页</Button>
      <Button variant="primary">当前页</Button>
      <Button>下一页</Button>
    </ButtonGroup>

    <ButtonGroup size="sm" vertical aria-label="排序">
      <Button>上移</Button>
      <Button>置顶</Button>
      <Button>下移</Button>
    </ButtonGroup>

    <ButtonGroup aria-label="单独操作">
      <Button>仅一颗</Button>
    </ButtonGroup>

    <div dir="rtl">
      <ButtonGroup size="sm" aria-label="从右到左">
        <Button>上一页</Button>
        <Button variant="primary">当前页</Button>
        <Button>下一页</Button>
      </ButtonGroup>
    </div>

    <ButtonGroup size="sm" aria-label="尺寸覆盖">
      <Button>组 sm</Button>
      <Button size="lg">子 lg</Button>
    </ButtonGroup>
  </div>
</template>
