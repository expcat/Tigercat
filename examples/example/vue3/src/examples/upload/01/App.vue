<script setup lang="ts">
import { reactive } from 'vue'
import type { UploadFile } from '@expcat/tigercat-vue'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Upload } from '@expcat/tigercat-vue/Upload'

const model = reactive<{ files: UploadFile[] }>({ files: [] })
</script>

<template>
  <Form :model="model" label-position="top">
    <FormItem name="files" label="图片">
      <Upload
        v-model:file-list="model.files"
        accept=".jpg,.jpeg,.png"
        :max-size="2 * 1024 * 1024"
        :limit="3"
        multiple
        list-type="picture" />
    </FormItem>
  </Form>
</template>
