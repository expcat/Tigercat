<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <Tooltip content="悬停触发" trigger="hover">
      <Button>hover</Button>
    </Tooltip>
    <Tooltip content="聚焦触发" trigger="focus">
      <Button>focus</Button>
    </Tooltip>
    <Tooltip content="点击触发" trigger="click">
      <Button>click</Button>
    </Tooltip>
  </div>
</template>
