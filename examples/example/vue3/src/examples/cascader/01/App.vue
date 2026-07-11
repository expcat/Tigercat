<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'

const value = ref<(string | number)[]>([])
const options = [
  {
    label: '浙江',
    value: 'zhejiang',
    children: [
      {
        label: '杭州',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          { label: '余杭区', value: 'yuhang' }
        ]
      }
    ]
  },
  {
    label: '江苏',
    value: 'jiangsu',
    children: [{ label: '南京', value: 'nanjing' }]
  }
]
</script>

<template>
  <Cascader v-model="value" :options="options" placeholder="请选择地区" class="w-full max-w-sm" />
</template>
