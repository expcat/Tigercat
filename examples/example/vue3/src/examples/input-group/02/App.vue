<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { InputGroupAddon } from '@expcat/tigercat-vue/InputGroupAddon'
import { Input } from '@expcat/tigercat-vue/Input'
</script>

<template>
  <div class="space-y-3">
    <InputGroup compact class="w-full max-w-md" aria-label="网址">
      <InputGroupAddon>https://</InputGroupAddon>
      <Input aria-label="站点域名" placeholder="example" />
      <InputGroupAddon>.com</InputGroupAddon>
    </InputGroup>
    <InputGroup compact class="w-full max-w-md" aria-label="搜索带图标">
      <InputGroupAddon>🔍</InputGroupAddon>
      <Input aria-label="搜索" placeholder="搜索内容" />
    </InputGroup>
  </div>
</template>
