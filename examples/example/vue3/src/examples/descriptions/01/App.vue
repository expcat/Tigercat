<script setup lang="ts">
import { Descriptions } from '@expcat/tigercat-vue/Descriptions'

const items = [
  { label: '姓名', content: '张三' },
  { label: '职位', content: '前端工程师' },
  { label: '邮箱', content: 'zhangsan@example.com' },
  { label: '状态', content: '在职' }
]
</script>

<template>
  <Descriptions title="用户信息" :items="items" :column="{ xs: 1, md: 2 }" />
</template>
