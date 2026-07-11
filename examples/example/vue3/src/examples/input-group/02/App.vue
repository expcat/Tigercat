<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { Input } from '@expcat/tigercat-vue/Input'
import { Select } from '@expcat/tigercat-vue/Select'
import { Button } from '@expcat/tigercat-vue/Button'
</script>

<template>
  <div class="min-w-0">
    <InputGroup>
      <Select
        :options="[
          { label: 'http://', value: 'http' },
          { label: 'https://', value: 'https' }
        ]"
        model-value="https"
        style="width: 120px" />
      <Input placeholder="请输入域名" style="flex: 1" />
      <Select
        :options="[
          { label: '.com', value: 'com' },
          { label: '.cn', value: 'cn' }
        ]"
        model-value="com"
        style="width: 80px" />
    </InputGroup>
  </div>
</template>
