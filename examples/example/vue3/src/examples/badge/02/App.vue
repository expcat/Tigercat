<script setup lang="ts">
import { Badge } from '@expcat/tigercat-vue/Badge'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Badge type="text" content="NEW" variant="success" />
    <Badge type="text" :content="150" :max="99" variant="info" />
  </div>
</template>
