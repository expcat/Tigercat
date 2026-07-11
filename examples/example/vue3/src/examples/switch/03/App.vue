<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'

const basicEnabled = ref(true)

const disabledOn = ref(true)
const disabledOff = ref(false)

const sizeSm = ref(false)
const sizeMd = ref(true)
const sizeLg = ref(false)
</script>

<template>
  <div class="min-w-0">
    <Space align="center">
      <Switch v-model="sizeSm" size="sm" aria-label="小尺寸开关" />
      <Switch v-model="sizeMd" size="md" aria-label="中尺寸开关" />
      <Switch v-model="sizeLg" size="lg" aria-label="大尺寸开关" />
    </Space>
  </div>
</template>
