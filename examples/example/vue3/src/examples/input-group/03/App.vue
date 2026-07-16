<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { Input } from '@expcat/tigercat-vue/Input'
import { Button } from '@expcat/tigercat-vue/Button'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-3">
    <InputGroup v-for="size in sizes" :key="size" compact :size="size" class="w-full max-w-md">
      <Input :aria-label="`尺寸 ${size}`" :placeholder="`size=${size}`" style="flex: 1" />
      <Button variant="primary">确定</Button>
    </InputGroup>
    <InputGroup size="md" class="w-full max-w-md">
      <Input aria-label="非紧凑" placeholder="compact=false（带间距）" style="flex: 1" />
      <Button variant="outline">操作</Button>
    </InputGroup>
    <p class="text-sm text-gray-500">size 统一控制子项高度；compact=false 时子项之间保留间距。</p>
  </div>
</template>
