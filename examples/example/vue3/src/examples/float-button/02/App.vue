<script setup lang="ts">
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-vue/FloatButtonGroup'
</script>

<template>
  <div class="relative h-56 rounded border">
    <FloatButtonGroup trigger="hover" placement="top-left">
      <FloatButton type="default" aria-label="编辑" />
      <FloatButton type="default" aria-label="分享" />
    </FloatButtonGroup>
  </div>
</template>
