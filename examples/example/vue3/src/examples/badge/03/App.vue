<script setup lang="ts">
import { Badge } from '@expcat/tigercat-vue/Badge'
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <Badge :content="5" :standalone="false" position="bottom-right" variant="danger">
    <Button variant="outline">消息</Button>
  </Badge>
</template>
