<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
</script>

<template>
  <div class="space-y-3">
    <Text tag="h2" size="lg" weight="semibold" copyable>可复制的标题</Text>
    <Text copyable>user-42</Text>
    <Text tag="span" :copyable="{ text: 'evt_8f2a', tooltip: '复制事件 ID' }">evt_8f2a</Text>
  </div>
</template>
