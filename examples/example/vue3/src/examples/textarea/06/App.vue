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
      <FormItem label="禁用">
        <Textarea model-value="禁用的文本域" disabled :rows="3" />
      </FormItem>
      <FormItem label="只读">
        <Textarea model-value="只读的文本域" readonly :rows="3" />
      </FormItem>
      <FormItem label="必填">
        <Textarea placeholder="必填的文本域" required :rows="3" />
      </FormItem>
    </Space>
  </div>
</template>
