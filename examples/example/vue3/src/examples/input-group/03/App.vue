<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { Input } from '@expcat/tigercat-vue/Input'
import { Select } from '@expcat/tigercat-vue/Select'
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-3">
      <InputGroup size="sm">
        <Input placeholder="小尺寸" style="flex: 1" />
        <Button variant="primary">确定</Button>
      </InputGroup>
      <InputGroup size="md">
        <Input placeholder="中尺寸" style="flex: 1" />
        <Button variant="primary">确定</Button>
      </InputGroup>
      <InputGroup size="lg">
        <Input placeholder="大尺寸" style="flex: 1" />
        <Button variant="primary">确定</Button>
      </InputGroup>
    </div>
  </div>
</template>
