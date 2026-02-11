<script setup lang="ts">
import { ref } from 'vue'
import { Image, ImageGroup, ImagePreview } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const PHOTOS = [
  'https://picsum.photos/seed/tiger1/600/400',
  'https://picsum.photos/seed/tiger2/600/400',
  'https://picsum.photos/seed/tiger3/600/400',
  'https://picsum.photos/seed/tiger4/600/400',
  'https://picsum.photos/seed/tiger5/600/400',
  'https://picsum.photos/seed/tiger6/600/400'
]

const previewVisible = ref(false)

const basicSnippet = `<div class="flex gap-4 flex-wrap">
  <Image src="${PHOTOS[0]}" alt="示例图片" :width="200" :height="150" />
  <Image src="${PHOTOS[1]}" alt="示例图片 2" :width="200" :height="150" />
</div>`

const fitSnippet = `<div class="flex gap-4 flex-wrap">
  <div v-for="mode in ['contain', 'cover', 'fill', 'none', 'scale-down']" :key="mode" class="text-center">
    <Image :src="src" :alt="mode" :width="120" :height="120" :fit="mode"
      class="border border-gray-200 rounded" />
    <p class="text-xs text-gray-500 mt-1">{{ mode }}</p>
  </div>
</div>`

const fallbackSnippet = `<div class="flex gap-4 items-start">
  <!-- fallbackSrc 回退 -->
  <div class="text-center">
    <Image src="/broken.jpg" fallback-src="${PHOTOS[0]}" :width="150" :height="100" alt="回退示例" />
    <p class="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
  </div>
  <!-- 自定义错误插槽 -->
  <div class="text-center">
    <Image src="/broken.jpg" :width="150" :height="100" alt="错误插槽">
      <template #error>
        <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
          加载失败
        </div>
      </template>
    </Image>
    <p class="text-xs text-gray-500 mt-1">错误插槽</p>
  </div>
</div>`

const lazySnippet = `<!-- lazy + placeholder 插槽 -->
<div class="flex gap-4">
  <Image src="${PHOTOS[2]}" :width="200" :height="150" lazy alt="懒加载">
    <template #placeholder>
      <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm animate-pulse">
        加载中…
      </div>
    </template>
  </Image>
</div>`

const previewSnippet = `<!-- 点击预览（默认开启） -->
<div class="flex gap-4 flex-wrap">
  <Image v-for="(src, i) in photos" :key="i" :src="src" :width="120" :height="80" alt="预览" />
</div>`

const groupSnippet = `<!-- ImageGroup：多图关联预览 -->
<ImageGroup>
  <div class="flex gap-4 flex-wrap">
    <Image v-for="(src, i) in photos" :key="i" :src="src" :width="120" :height="80" alt="组图" />
  </div>
</ImageGroup>`

const standalonePreviewSnippet = `<button @click="previewVisible = true">打开预览</button>
<ImagePreview v-model:visible="previewVisible" :images="photos" :current-index="0" />`

const noPreviewSnippet = `<!-- 关闭预览 -->
<Image src="${PHOTOS[0]}" :width="200" :height="150" :preview="false" alt="无预览" />`
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">Image 图片</h1>
    <p class="text-gray-600 mb-8">
      图片展示组件，支持适配模式、懒加载、错误回退、点击预览、多图组预览。
    </p>

    <DemoBlock title="基本用法" description="使用 src 和尺寸属性展示图片" :code="basicSnippet">
      <div class="flex gap-4 flex-wrap">
        <Image :src="PHOTOS[0]" alt="示例图片" :width="200" :height="150" :preview="false" />
        <Image :src="PHOTOS[1]" alt="示例图片 2" :width="200" :height="150" :preview="false" />
      </div>
    </DemoBlock>

    <DemoBlock title="适配模式" description="fit 属性控制图片在容器中的适配方式" :code="fitSnippet">
      <div class="flex gap-4 flex-wrap">
        <div
          v-for="mode in (['contain', 'cover', 'fill', 'none', 'scale-down'] as const)"
          :key="mode"
          class="text-center">
          <Image
            :src="PHOTOS[0]"
            :alt="mode"
            :width="120"
            :height="120"
            :fit="mode"
            :preview="false"
            class="border border-gray-200 rounded" />
          <p class="text-xs text-gray-500 mt-1">{{ mode }}</p>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="加载失败回退" description="设置 fallbackSrc 或使用 error 插槽自定义错误状态" :code="fallbackSnippet">
      <div class="flex gap-4 items-start">
        <div class="text-center">
          <Image src="/broken.jpg" :fallback-src="PHOTOS[0]" :width="150" :height="100" alt="回退示例" :preview="false" />
          <p class="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
        </div>
        <div class="text-center">
          <Image src="/broken.jpg" :width="150" :height="100" alt="错误插槽" :preview="false">
            <template #error>
              <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm rounded">
                加载失败
              </div>
            </template>
          </Image>
          <p class="text-xs text-gray-500 mt-1">错误插槽</p>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="懒加载" description="lazy 属性开启 IntersectionObserver 懒加载" :code="lazySnippet">
      <div class="flex gap-4">
        <Image :src="PHOTOS[2]" :width="200" :height="150" lazy alt="懒加载" :preview="false">
          <template #placeholder>
            <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm animate-pulse rounded">
              加载中…
            </div>
          </template>
        </Image>
      </div>
    </DemoBlock>

    <DemoBlock title="点击预览" description="默认开启，点击图片进入全屏预览" :code="previewSnippet">
      <div class="flex gap-4 flex-wrap">
        <Image
          v-for="(src, i) in PHOTOS.slice(0, 4)"
          :key="i"
          :src="src"
          :width="120"
          :height="80"
          alt="预览" />
      </div>
    </DemoBlock>

    <DemoBlock title="关闭预览" description="设置 :preview=&quot;false&quot; 禁用点击预览" :code="noPreviewSnippet">
      <Image :src="PHOTOS[0]" :width="200" :height="150" :preview="false" alt="无预览" />
    </DemoBlock>

    <DemoBlock title="图片组 ImageGroup" description="用 ImageGroup 包裹多张 Image，点击任一图片进入多图预览" :code="groupSnippet">
      <ImageGroup>
        <div class="flex gap-4 flex-wrap">
          <Image
            v-for="(src, i) in PHOTOS"
            :key="i"
            :src="src"
            :width="120"
            :height="80"
            alt="组图" />
        </div>
      </ImageGroup>
    </DemoBlock>

    <DemoBlock
      title="独立 ImagePreview"
      description="直接使用 ImagePreview 组件，可编程控制预览"
      :code="standalonePreviewSnippet">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        @click="previewVisible = true">
        打开预览
      </button>
      <ImagePreview v-model:visible="previewVisible" :images="PHOTOS" :current-index="0" />
    </DemoBlock>
  </div>
</template>
