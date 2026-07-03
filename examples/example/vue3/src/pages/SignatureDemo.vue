<script setup lang="ts">
import { Signature } from '@expcat/tigercat-vue/Signature'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import type { SignatureChangePayload, SignatureExportType } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './SignatureDemo.vue?raw'

interface SignatureExpose {
  clear: () => void
  toDataURL: (type?: SignatureExportType, quality?: number) => string
  toSVG: () => string
}

const signatureRef = ref<SignatureExpose | null>(null)
const signatureValue = ref('')
const previewUrl = ref('')
const svgText = ref('')

const handleChange = (payload: SignatureChangePayload) => {
  signatureValue.value = payload.empty ? '' : payload.value
}

const exportPng = () => {
  const url = signatureRef.value?.toDataURL('image/png')
  if (url) previewUrl.value = url
}

const exportSvg = () => {
  const svg = signatureRef.value?.toSVG()
  if (svg) svgText.value = svg
}

const basicSnippet = `<Signature
  :width="420"
  :height="180"
  pen-color="#0f766e"
  :line-width="3"
  export-type="image/svg+xml"
  aria-label="合同签名"
  clear-text="清空"
  @change="handleChange" />`

const exportSnippet = `const signatureRef = ref()

const exportPng = () => {
  const url = signatureRef.value?.toDataURL('image/png')
  if (url) previewUrl.value = url
}

const exportSvg = () => {
  const svg = signatureRef.value?.toSVG()
  if (svg) svgText.value = svg
}`

const disabledSnippet = `<Signature disabled aria-label="禁用签名" clear-text="清空" />
<Signature readonly aria-label="只读签名" clear-text="清空" />`
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Signature 手写签名</h1>
    <p class="text-gray-500 mb-8">手写签名画板，支持颜色、线宽、清空和 PNG / SVG 导出。</p>

    <DemoBlock
      title="基本用法"
      description="通过 change 事件获取当前签名导出值"
      :code="fullPageSnippet">
      <div class="space-y-3">
        <Signature
          :width="420"
          :height="180"
          pen-color="#0f766e"
          :line-width="3"
          export-type="image/svg+xml"
          aria-label="合同签名"
          clear-text="清空"
          @change="handleChange" />
        <p class="text-sm text-gray-500">
          {{ signatureValue ? `已生成签名值：${signatureValue.slice(0, 64)}...` : '等待签名' }}
        </p>
      </div>
    </DemoBlock>

    <DemoBlock
      title="导出"
      description="通过 ref 导出 PNG data URL 或 SVG 字符串"
      :code="fullPageSnippet">
      <div class="space-y-4">
        <Signature
          ref="signatureRef"
          :width="420"
          :height="180"
          background-color="#ffffff"
          aria-label="导出签名"
          clear-text="清空" />
        <div class="flex flex-wrap gap-3">
          <Button @click="exportPng">导出 PNG</Button>
          <Button variant="secondary" @click="exportSvg">导出 SVG</Button>
          <Button variant="secondary" @click="signatureRef?.clear()">清空</Button>
        </div>
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="max-w-xs rounded border border-gray-200 bg-white"
          alt="签名 PNG 预览" />
        <pre
          v-if="svgText"
          class="max-h-40 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600"
          >{{ svgText }}</pre
        >
      </div>
    </DemoBlock>

    <DemoBlock
      title="禁用和只读"
      description="disabled / readonly 状态下不可绘制"
      :code="fullPageSnippet">
      <div class="grid gap-4 md:grid-cols-2">
        <Signature :width="320" :height="140" disabled aria-label="禁用签名" clear-text="清空" />
        <Signature :width="320" :height="140" readonly aria-label="只读签名" clear-text="清空" />
      </div>
    </DemoBlock>
  </div>
</template>
