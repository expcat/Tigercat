<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { Input } from '@expcat/tigercat-vue/Input'
import { Select } from '@expcat/tigercat-vue/Select'
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <div class="min-w-0">
    <InputGroup>
      <Input placeholder="搜索内容" style="flex: 1" />
      <Button variant="primary">搜索</Button>
    </InputGroup>
  </div>
</template>
