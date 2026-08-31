<script setup lang="ts">
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Badge :content="12" :max="9" size="lg" variant="danger" />
    <Badge :content="0" show-zero />
    <Badge type="dot" />
  </div>
</template>
