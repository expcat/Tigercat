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
      <FormItem label="基础自动高度">
        <Textarea v-model="autoResizeText" autoResize placeholder="输入内容后将自动调整高度" />
      </FormItem>
      <FormItem label="限制行数 (3-8)">
        <Textarea autoResize :minRows="3" :maxRows="8" placeholder="最少 3 行，最多 8 行" />
      </FormItem>
    </Space>
  </div>
</template>
