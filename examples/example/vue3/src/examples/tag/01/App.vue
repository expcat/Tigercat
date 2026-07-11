<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Tag } from '@expcat/tigercat-vue/Tag'

const visible = ref(true)
</script>

<template>
  <Tag v-if="visible" variant="primary" size="lg" closable @close="visible = false">
    可关闭标签
  </Tag>
  <Button v-else variant="ghost" @click="visible = true">恢复标签</Button>
</template>
