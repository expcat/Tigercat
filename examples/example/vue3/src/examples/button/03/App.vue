<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { ButtonGroup } from '@expcat/tigercat-vue/ButtonGroup'
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap">
    <ButtonGroup size="sm">
      <Button>上一页</Button>
      <Button variant="primary">当前页</Button>
      <Button>下一页</Button>
    </ButtonGroup>

    <ButtonGroup size="sm" vertical>
      <Button>上移</Button>
      <Button>置顶</Button>
      <Button>下移</Button>
    </ButtonGroup>
  </div>
</template>
