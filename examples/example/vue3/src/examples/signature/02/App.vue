<script setup lang="ts">
import { ref } from 'vue'
import { Signature } from '@expcat/tigercat-vue/Signature'

const red = ref('')
const dark = ref('')
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div class="w-[280px] space-y-1">
      <Signature :width="280" :height="140" pen-color="#dc2626" :line-width="2" v-model="red" />
      <p class="text-xs text-[var(--tiger-text-secondary)]">penColor 红 · lineWidth 2</p>
    </div>
    <div class="w-[280px] space-y-1">
      <Signature
        :width="280"
        :height="140"
        pen-color="#f8fafc"
        background-color="#0f172a"
        :line-width="4"
        v-model="dark" />
      <p class="text-xs text-[var(--tiger-text-secondary)]">
        backgroundColor 深色 · lineWidth 4
      </p>
    </div>
  </div>
</template>
