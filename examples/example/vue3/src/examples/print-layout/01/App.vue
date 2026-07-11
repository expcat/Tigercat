<script setup lang="ts">
import { PrintLayout } from '@expcat/tigercat-vue/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-vue/PrintPageBreak'
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">默认 A4 纵向布局</p>
        <PrintLayout>
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px">文档标题</h2>
          <p>这是一段打印内容示例文本。PrintLayout 组件会按照纸张尺寸约束内容宽度。</p>
        </PrintLayout>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">页眉页脚</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          showHeader / showFooter 开启，支持自定义文字
        </p>
        <PrintLayout
          show-header
          show-footer
          header-text="Tigercat Inc."
          footer-text="Confidential — Page 1">
          <p>包含页眉和页脚的打印布局。也可以使用 header / footer 插槽自定义渲染。</p>
        </PrintLayout>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">横向 & 分页</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          orientation='landscape'，插入 PrintPageBreak 分页
        </p>
        <PrintLayout orientation="landscape" show-header header-text="横向报告" show-page-breaks>
          <p>第一页内容 — 横向 A4。</p>
          <PrintPageBreak />
          <p>第二页内容 — PrintPageBreak 会插入分页线。</p>
        </PrintLayout>
      </section>
    </div>
  </div>
</template>
