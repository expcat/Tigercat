<script setup lang="ts">
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
</script>

<template>
  <ConfigProvider :locale="zhTW">
    <div class="flex flex-col gap-6">
      <FormItem label="時間">
        <TimePicker min-time="09:30" />
      </FormItem>
      <TimePicker format="12" />
    </div>
  </ConfigProvider>
</template>
