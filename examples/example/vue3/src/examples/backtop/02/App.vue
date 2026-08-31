<script setup lang="ts">
import { BackTop } from '@expcat/tigercat-vue/BackTop'
</script>

<template>
  <div id="backtop-demo-container" class="relative h-64 overflow-auto rounded border">
    <div class="h-[900px] p-4">
      <p>在此容器内向下滚动。target 与 Affix 一样是滚动根选择器。</p>
    </div>
    <BackTop target="#backtop-demo-container" :visibility-height="100" position="sticky" />
  </div>
</template>
