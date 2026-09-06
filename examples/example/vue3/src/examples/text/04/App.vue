<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
</script>

<template>
  <div class="space-y-3">
    <Text copyable>user-42</Text>
    <Text tag="span" :copyable="{ text: 'evt_8f2a', tooltip: '复制事件 ID' }">evt_8f2a</Text>
  </div>
</template>
