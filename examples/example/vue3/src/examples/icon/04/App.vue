<script setup lang="ts">
import { Icon } from '@expcat/tigercat-vue/Icon'
import { iconNames, extendedIcons, type IconDefinition } from '@expcat/tigercat-core'

// 自定义 Logo：定义一次 IconDefinition，处处通过 icon 属性复用
const demoLogo: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: ['M12 2 2 19.5h20L12 2Zm0 5.25 5.5 9.75h-11L12 7.25Z'],
  mode: 'fill'
}
</script>

<template>
  <div class="min-w-0">
    <div class="flex items-center gap-6">
      <Icon :icon="demoLogo" size="lg" />
      <Icon :icon="demoLogo" size="xl" color="#f59e0b" />
    </div>
  </div>
</template>
