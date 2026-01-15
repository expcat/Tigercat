<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Divider 分割线</h1>
      <p class="text-gray-600">区隔内容的分割线。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">默认水平分割线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">上方内容</div>
        <Divider />
        <div class="text-gray-700">下方内容</div>
      </div>
    </section>

    <!-- 线条样式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">线条样式</h2>
      <p class="text-gray-600 mb-6">lineStyle 支持 solid / dashed / dotted。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">solid</div>
        <Divider line-style="solid" />
        <div class="text-sm text-gray-600">dashed</div>
        <Divider line-style="dashed" />
        <div class="text-sm text-gray-600">dotted</div>
        <Divider line-style="dotted" />
      </div>
    </section>

    <!-- 间距 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">间距</h2>
      <p class="text-gray-600 mb-6">spacing 控制分割线周围留白。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">spacing="sm"</div>
        <Divider spacing="sm" />
        <div class="text-gray-700">spacing="md"</div>
        <Divider spacing="md" />
        <div class="text-gray-700">spacing="lg"</div>
        <Divider spacing="lg" />
      </div>
    </section>

    <!-- 自定义颜色/粗细 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义颜色与粗细</h2>
      <p class="text-gray-600 mb-6">通过 color / thickness 自定义边框颜色与宽度。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="text-gray-700">color="#2563eb" thickness="2px"</div>
        <Divider color="#2563eb" thickness="2px" />
        <div class="text-gray-700">color="#10b981" thickness="4px"（dashed）</div>
        <Divider color="#10b981" thickness="4px" line-style="dashed" />
      </div>
    </section>

    <!-- 垂直分割线 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">垂直分割线</h2>
      <p class="text-gray-600 mb-6">orientation="vertical" 用于行内内容分隔。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex items-center h-12">
          <span class="text-gray-700">Left</span>
          <Divider orientation="vertical" class="h-6" />
          <span class="text-gray-700">Middle</span>
          <Divider orientation="vertical" class="h-6" line-style="dashed" />
          <span class="text-gray-700">Right</span>
        </div>
      </div>
    </section>
  </div>
</template>
