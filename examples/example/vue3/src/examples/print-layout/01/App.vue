<script setup lang="ts">
import { PrintLayout } from '@expcat/tigercat-vue/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-vue/PrintPageBreak'
</script>

<template>
  <PrintLayout
    orientation="landscape"
    show-header
    show-footer
    show-page-breaks
    header-text="季度报告"
    footer-text="Tigercat">
    <h2 class="text-xl font-bold">第一页</h2>
    <p>横向 A4 打印内容。</p>
    <PrintPageBreak />
    <h2 class="text-xl font-bold">第二页</h2>
  </PrintLayout>
</template>
