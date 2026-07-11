<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { Input } from '@expcat/tigercat-vue/Input'
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <InputGroup compact size="lg" class="w-full max-w-md">
    <Input aria-label="搜索内容" placeholder="输入关键词" style="flex: 1" />
    <Button variant="primary">搜索</Button>
  </InputGroup>
</template>
