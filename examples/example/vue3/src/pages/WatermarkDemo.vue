<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './WatermarkDemo.vue?raw'

const watermarkImage =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2264%22 viewBox=%220 0 120 64%22%3E%3Crect width=%22120%22 height=%2264%22 rx=%2214%22 fill=%22%232563eb%22 fill-opacity=%220.12%22/%3E%3Cpath d=%22M22 42L38 22L53 42M45 33H31%22 fill=%22none%22 stroke=%22%232563eb%22 stroke-width=%225%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ctext x=%2264%22 y=%2239%22 font-family=%22Arial%22 font-size=%2216%22 font-weight=%22700%22 fill=%22%232563eb%22%3ETC%3C/text%3E%3C/svg%3E'

const textSnippet = `<Watermark content="Tigercat">
  <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
    <p>这里是被水印覆盖的内容区域。水印文字会以倾斜角度重复平铺。</p>
  </div>
</Watermark>`

const multiSnippet = `<Watermark :content="['Tigercat', '2024-01-01']" :font="{ fontSize: 14, color: 'rgba(0,0,0,0.1)' }">
  <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
    <p>多行水印文字，每行独立显示。可自定义字体大小和颜色。</p>
  </div>
</Watermark>`

const configSnippet = `<Watermark content="Custom" :rotate="-30" :gap-x="120" :gap-y="80" :z-index="5">
  <div style="height: 300px" class="bg-blue-50 rounded-lg p-4">
    <p>自定义旋转角度、水印间距和层级。</p>
  </div>
</Watermark>`

const imageSnippet = `<Watermark :image="watermarkImage" :width="120" :height="64" :gap-x="120" :gap-y="80">
  <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
    <p>使用 image 属性可以展示图片水印。</p>
  </div>
</Watermark>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Watermark 水印</h1>
    <p class="text-gray-500 mb-8">在页面上添加水印，支持文字和图片，防止信息泄露。</p>

    <DemoBlock title="文字水印" description="基本水印效果" :code="fullPageSnippet">
      <Watermark content="Tigercat">
        <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
          <p>这里是被水印覆盖的内容区域。水印文字会以倾斜角度重复平铺。</p>
        </div>
      </Watermark>
    </DemoBlock>

    <DemoBlock
      title="多行水印"
      description="content 传数组实现多行，自定义字体"
      :code="fullPageSnippet">
      <Watermark
        :content="['Tigercat', '2024-01-01']"
        :font="{ fontSize: 14, color: 'rgba(0,0,0,0.1)' }">
        <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
          <p>多行水印文字，每行独立显示。可自定义字体大小和颜色。</p>
        </div>
      </Watermark>
    </DemoBlock>

    <DemoBlock title="自定义配置" description="调整旋转角度、间距和层级" :code="fullPageSnippet">
      <Watermark content="Custom" :rotate="-30" :gap-x="120" :gap-y="80" :z-index="5">
        <div style="height: 300px" class="bg-blue-50 rounded-lg p-4">
          <p>自定义旋转角度、水印间距和层级。</p>
        </div>
      </Watermark>
    </DemoBlock>

    <DemoBlock
      title="图片水印"
      description="通过 image 属性使用图片作为水印"
      :code="fullPageSnippet">
      <Watermark :image="watermarkImage" :width="120" :height="64" :gap-x="120" :gap-y="80">
        <div style="height: 300px" class="bg-gray-50 rounded-lg p-4">
          <p>使用 image 属性可以展示图片水印，适合品牌标识或图形化保密标记。</p>
        </div>
      </Watermark>
    </DemoBlock>
  </div>
</template>
