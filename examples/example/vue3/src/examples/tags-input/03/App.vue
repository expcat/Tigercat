<script setup lang="ts">
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { TagsInput } from '@expcat/tigercat-vue/TagsInput'
</script>

<template>
  <div class="w-full max-w-md space-y-4">
    <TagsInput :default-value="['sm']" size="sm" clearable placeholder="小尺寸" />
    <TagsInput
      :default-value="['warn']"
      size="md"
      status="warning"
      clearable
      placeholder="警告态" />
    <FormItem label="标签" error="至少保留一个标签">
      <TagsInput :default-value="['error']" size="lg" clearable />
    </FormItem>
  </div>
</template>
