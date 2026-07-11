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
    <div class="grid gap-4 md:grid-cols-2">
      <Signature :width="320" :height="140" disabled aria-label="禁用签名" clear-text="清空" />
      <Signature :width="320" :height="140" readonly aria-label="只读签名" clear-text="清空" />
    </div>
  </div>
</template>
