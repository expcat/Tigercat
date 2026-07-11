<script setup lang="ts">
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
</script>

<template>
  <FloatButton
    floating
    placement="bottom-right"
    :offset="{ x: 32, y: 32 }"
    size="lg"
    shape="square"
    tooltip="新建"
    aria-label="新建内容" />
</template>
