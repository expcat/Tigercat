<script setup lang="ts">
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
</script>

<template>
  <div class="flex flex-col gap-6">
    <FormItem label="时间">
      <TimePicker min-time="09:30" />
    </FormItem>
    <TimePicker format="12" />
  </div>
</template>
