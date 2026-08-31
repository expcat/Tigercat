<script setup lang="ts">
import { Steps } from '@expcat/tigercat-vue/Steps'
import { StepsItem } from '@expcat/tigercat-vue/StepsItem'
</script>

<template>
  <Steps>
    <StepsItem title="填写资料" description="完善账户信息" />
    <StepsItem title="身份验证" description="确认联系方式" />
    <StepsItem title="完成" description="开始使用" />
  </Steps>
</template>
