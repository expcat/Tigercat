<script setup lang="ts">
import { ref } from 'vue'
import { PrintLayout } from '@expcat/tigercat-vue/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-vue/PrintPageBreak'
import { Button } from '@expcat/tigercat-vue/Button'
import type { PrintLayoutInstance } from '@expcat/tigercat-vue'

const layoutRef = ref<PrintLayoutInstance | null>(null)
</script>

<template>
  <div class="space-y-3">
    <Button size="sm" @click="layoutRef?.print()">打印</Button>
    <PrintLayout
      ref="layoutRef"
      page-size="A4"
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
  </div>
</template>
