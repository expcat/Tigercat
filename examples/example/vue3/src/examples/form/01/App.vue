<script setup lang="ts">
import { reactive } from 'vue'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'

const model = reactive({ name: '' })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
    <Form :model="model" label-position="top">
      <FormItem name="name" label="名称">
        <Input v-model="model.name" placeholder="请输入名称" />
      </FormItem>
    </Form>
    <pre class="overflow-auto rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">{{
      JSON.stringify(model, null, 2)
    }}</pre>
  </div>
</template>
