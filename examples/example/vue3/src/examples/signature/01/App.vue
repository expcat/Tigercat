<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Signature } from '@expcat/tigercat-vue/Signature'

const value = ref('')
</script>

<template>
  <div class="w-full max-w-[320px] space-y-2">
    <FormItem name="sign" label="合同签名">
      <Signature v-model="value" export-type="image/jpeg" />
    </FormItem>
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      {{ value ? '已签名（受控值为 SVG data URL）' : '等待签名' }}
    </p>
    <img
      v-if="value"
      :src="value"
      alt=""
      class="w-full rounded border border-[var(--tiger-border,#d1d5db)]" />
  </div>
</template>
