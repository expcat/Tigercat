<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'

const watermarkImage =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2264%22 viewBox=%220 0 120 64%22%3E%3Crect width=%22120%22 height=%2264%22 rx=%2214%22 fill=%22%232563eb%22 fill-opacity=%220.12%22/%3E%3Cpath d=%22M22 42L38 22L53 42M45 33H31%22 fill=%22none%22 stroke=%22%232563eb%22 stroke-width=%225%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ctext x=%2264%22 y=%2239%22 font-family=%22Arial%22 font-size=%2216%22 font-weight=%22700%22 fill=%22%232563eb%22%3ETC%3C/text%3E%3C/svg%3E'
</script>

<template>
  <div class="min-w-0">
    <Watermark content="Tigercat">
      <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
        <p>这里是被水印覆盖的内容区域。水印文字会以倾斜角度重复平铺。</p>
      </div>
    </Watermark>
  </div>
</template>
