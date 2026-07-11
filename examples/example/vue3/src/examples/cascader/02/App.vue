<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'

const val = ref<(string | number)[]>([])
const val2 = ref<(string | number)[]>([])

const options = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      {
        label: '杭州',
        value: 'hz',
        children: [
          { label: '西湖区', value: 'xh' },
          { label: '余杭区', value: 'yh' }
        ]
      },
      { label: '宁波', value: 'nb', children: [{ label: '鄞州区', value: 'yz' }] }
    ]
  },
  {
    label: '江苏',
    value: 'js',
    children: [
      {
        label: '南京',
        value: 'nj',
        children: [
          { label: '鼓楼区', value: 'gl' },
          { label: '玄武区', value: 'xw' }
        ]
      },
      { label: '苏州', value: 'sz', children: [{ label: '虎丘区', value: 'hq' }] }
    ]
  }
]
</script>

<template>
  <div class="min-w-0">
    <Cascader v-model="val2" :options="options" placeholder="搜索地区" searchable />
  </div>
</template>
