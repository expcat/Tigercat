<script setup lang="ts">
import { Signature } from '@expcat/tigercat-vue/Signature'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import type { SignatureChangePayload, SignatureExportType } from '@expcat/tigercat-core'

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
</script>

<template>
  <div class="min-w-0">
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
        >{{ svgText }}</pre>
    </div>
  </div>
</template>
