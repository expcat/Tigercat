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
      <FormItem label="仅计数">
        <Textarea showCount placeholder="显示字符数" />
      </FormItem>
      <FormItem label="限制最大长度 (100)">
        <Textarea v-model="limited" showCount :maxLength="100" placeholder="最多 100 个字符" />
      </FormItem>
    </Space>
  </div>
</template>
