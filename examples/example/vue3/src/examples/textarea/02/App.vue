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
      <FormItem label="Small">
        <Textarea size="sm" placeholder="Small textarea" />
      </FormItem>
      <FormItem label="Medium">
        <Textarea size="md" placeholder="Medium textarea" />
      </FormItem>
      <FormItem label="Large">
        <Textarea size="lg" placeholder="Large textarea" />
      </FormItem>
    </Space>
  </div>
</template>
