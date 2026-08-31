<script setup lang="ts">
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { TagsInput } from '@expcat/tigercat-vue/TagsInput'
</script>

<template>
  <div class="w-full max-w-md space-y-2">
    <FormItem label="技术栈">
      <TagsInput :default-value="['vue', 'react']" :max="5" placeholder="回车添加，最多 5 个" />
    </FormItem>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      非受控；输入后回车创建，退格删除，达到上限拒绝添加。
    </p>
  </div>
</template>
