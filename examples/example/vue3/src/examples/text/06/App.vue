<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <div class="grid grid-cols-1 gap-4">
      <div class="p-4 bg-white rounded">
        <Text align="left">Left aligned text</Text>
      </div>
      <div class="p-4 bg-white rounded">
        <Text align="center">Center aligned text</Text>
      </div>
      <div class="p-4 bg-white rounded">
        <Text align="right">Right aligned text</Text>
      </div>
      <div class="p-4 bg-white rounded">
        <Text align="justify"
          >Justify aligned —
          两端对齐模式下，较长的文本内容会均匀分布在行内，呈现整齐的段落效果。</Text
        >
      </div>
    </div>
  </div>
</template>
