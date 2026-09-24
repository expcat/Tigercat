<script setup lang="ts">
import { reactive } from 'vue'
import type { UploadFile } from '@expcat/tigercat-core'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { Upload } from '@expcat/tigercat-vue/Upload'

const model = reactive<{ name: string; files: UploadFile[] }>({ name: '', files: [] })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
    <Form
      :model-value="model"
      label-position="top"
      @update:model-value="Object.assign(model, $event)">
      <FormItem name="name" label="名称">
        <Input placeholder="请输入名称" />
      </FormItem>
      <FormItem name="files" label="附件">
        <Upload v-model:file-list="model.files" />
      </FormItem>
    </Form>
    <pre class="overflow-auto rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">{{
      JSON.stringify(model, null, 2)
    }}</pre>
  </div>
</template>
