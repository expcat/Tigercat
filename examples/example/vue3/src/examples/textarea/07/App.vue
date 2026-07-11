<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { ref } from 'vue'
import { Textarea } from '@expcat/tigercat-vue/Textarea'

const text = ref('')
const autoResizeText = ref('')
const limited = ref('')
const combined = ref('')
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full max-w-md">
      <Textarea
        v-model="combined"
        autoResize
        :minRows="3"
        :maxRows="10"
        showCount
        :maxLength="500"
        placeholder="自动高度 + 字符计数 + 最大长度" />
    </Space>
  </div>
</template>
