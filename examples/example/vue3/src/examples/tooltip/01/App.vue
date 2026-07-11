<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Tooltip } from '@expcat/tigercat-vue/Tooltip'
</script>

<template>
  <Tooltip content="保存当前草稿" placement="top" trigger="hover">
    <Button>保存</Button>
  </Tooltip>
</template>
