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
    <div class="flex items-center gap-8">
      <Icon>
        <svg>
          <path d="M5 13l4 4L19 7" />
        </svg>
      </Icon>
      <Icon aria-label="搜索">
        <svg>
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Icon>
    </div>
  </div>
</template>
