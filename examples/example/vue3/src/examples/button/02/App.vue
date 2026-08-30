<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const submitted = ref('')

function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  submitted.value = String(new FormData(form).get('title') ?? '')
}

function onReset() {
  submitted.value = ''
}
</script>

<template>
  <form @submit.prevent="onSubmit" @reset="onReset">
    <label>
      名称
      <input name="title" value="Tigercat" style="margin-inline-start: 8px" />
    </label>
    <div style="display: flex; gap: 8px; margin-top: 12px">
      <Button type="submit">提交</Button>
      <Button html-type="reset">重置</Button>
    </div>
    <p v-if="submitted">已提交 {{ submitted }}</p>
  </form>
</template>
