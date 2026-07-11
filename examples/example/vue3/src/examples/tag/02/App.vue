<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <Tag variant="warning" closable @close="$event.preventDefault()">阻止关闭</Tag>
</template>
