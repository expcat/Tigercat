<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'

const logo =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2264%22%3E%3Crect width=%22120%22 height=%2264%22 rx=%2214%22 fill=%22%232563eb%22 fill-opacity=%220.12%22/%3E%3Ctext x=%2260%22 y=%2240%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 font-weight=%22700%22 fill=%22%232563eb%22%3ETC%3C/text%3E%3C/svg%3E'
</script>

<template>
  <Watermark :image="logo" :width="120" :height="64" :gap-x="120" :gap-y="80">
    <div class="h-56 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      图片水印适合品牌标识或图形化保密标记。
    </div>
  </Watermark>
</template>
