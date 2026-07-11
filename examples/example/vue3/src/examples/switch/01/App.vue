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
    <Space direction="vertical">
      <div class="flex items-center gap-3">
        <Switch v-model="basicEnabled" aria-label="开启消息通知" />
        <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
      </div>
    </Space>
  </div>
</template>
