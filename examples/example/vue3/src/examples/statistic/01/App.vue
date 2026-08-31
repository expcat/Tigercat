<script setup lang="ts">
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Statistic } from '@expcat/tigercat-vue/Statistic'
</script>

<template>
  <ConfigProvider :locale="zhCN">
    <Statistic
      title="本月收入"
      :value="89320.5"
      :precision="2"
      prefix="¥"
      suffix=" CNY"
      size="lg"
      :group-separator="true" />
  </ConfigProvider>
</template>
