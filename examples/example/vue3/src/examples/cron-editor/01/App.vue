<script setup lang="ts">
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

const value = ref('0 9 * * 1-5')
</script>

<template>
  <ConfigProvider :locale="zhTW">
    <FormItem label="執行計畫">
      <CronEditor v-model="value" />
    </FormItem>
  </ConfigProvider>
</template>
