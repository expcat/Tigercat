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
    <Space>
      <Switch v-model="disabledOn" disabled aria-label="已开启的禁用开关" />
      <Switch v-model="disabledOff" disabled aria-label="已关闭的禁用开关" />
    </Space>
  </div>
</template>
