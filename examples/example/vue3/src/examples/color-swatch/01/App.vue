<script setup lang="ts">
import { ref } from 'vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const color = ref('#f59e0b')
const groups = [
  {
    label: '品牌色',
    colors: [
      { value: '#2563eb', label: '蓝色' },
      { value: '#0891b2', label: '青色' },
      { value: '#059669', label: '绿色' },
      { value: '#7c3aed', label: '紫色' }
    ]
  },
  {
    label: '状态色',
    colors: [
      { value: '#f59e0b', label: '警告' },
      { value: '#eab308', label: '浅黄' },
      { value: '#dc2626', label: '错误' },
      { value: '#22c55e', label: '成功' },
      { value: '#0ea5e9', label: '信息' },
      { value: '#94a3b8', label: '禁用', disabled: true }
    ]
  }
]
</script>

<template>
  <FormItem label="主题色">
    <ColorSwatch v-model="color" :groups="groups" :columns="6" size="lg" />
  </FormItem>
</template>
