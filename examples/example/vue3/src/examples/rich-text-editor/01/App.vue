<script setup lang="ts">
import { ref } from 'vue'
import { RichTextEditor } from '@expcat/tigercat-vue/RichTextEditor'

const content = ref('<p>Hello <strong>Tigercat</strong>!</p>')
const sampleHtml = '<p>这是一段<em>只读</em>的富文本内容。</p>'
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">v-model 绑定 HTML 内容</p>
        <RichTextEditor v-model:value="content" :height="250" placeholder="在这里编辑..." />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">只读 & 禁用</h3>
        <div class="flex gap-4">
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-2">只读</p>
            <RichTextEditor :value="sampleHtml" :height="150" read-only />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-2">禁用</p>
            <RichTextEditor :value="sampleHtml" :height="150" disabled />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
