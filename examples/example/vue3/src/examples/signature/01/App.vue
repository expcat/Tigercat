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
  </div>
</template>
