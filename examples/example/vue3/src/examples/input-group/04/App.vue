<script setup lang="ts">
import { InputGroup } from '@expcat/tigercat-vue/InputGroup'
import { InputGroupAddon } from '@expcat/tigercat-vue/InputGroupAddon'
import { Input } from '@expcat/tigercat-vue/Input'
</script>

<template>
  <InputGroup compact class="w-full max-w-md" aria-label="带计数的域名">
    <InputGroupAddon>https://</InputGroupAddon>
    <Input aria-label="主机名" model-value="example" show-count :max-length="32" />
  </InputGroup>
</template>
