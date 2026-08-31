<script setup lang="ts">
import { ref } from 'vue'
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { Text } from '@expcat/tigercat-vue/Text'

const before = 'https://picsum.photos/seed/tiger-compare-slot-before/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-slot-after/800/500'
const position = ref(60)
const clicked = ref(false)
</script>

<template>
  <div class="flex flex-col gap-2">
    <Text size="sm">当前位置 {{ position }}%{{ clicked ? ' · 已点 after 按钮' : '' }}</Text>
    <ImageCompare v-model:position="position" :width="480" :height="280" aria-label="装修前后对比">
      <template #before>
        <img :src="before" alt="插槽 before" class="block h-full w-full object-cover" />
      </template>
      <template #after>
        <div class="relative h-full w-full">
          <img :src="after" alt="插槽 after" class="block h-full w-full object-cover" />
          <button
            type="button"
            class="absolute bottom-3 end-3 rounded bg-white px-2 py-1 text-sm shadow"
            @click="clicked = true">
            查看 after
          </button>
        </div>
      </template>
    </ImageCompare>
  </div>
</template>
