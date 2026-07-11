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
      <FormItem label="2行">
        <Textarea placeholder="2行文本域" :rows="2" />
      </FormItem>
      <FormItem label="4行">
        <Textarea placeholder="4行文本域" :rows="4" />
      </FormItem>
      <FormItem label="6行">
        <Textarea placeholder="6行文本域" :rows="6" />
      </FormItem>
    </Space>
  </div>
</template>
