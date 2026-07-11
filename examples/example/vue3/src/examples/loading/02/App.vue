<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Card } from '@expcat/tigercat-vue/Card'
import { ref } from 'vue'
import { Loading } from '@expcat/tigercat-vue/Loading'

const pageLoading = ref(false)
const cardLoading = ref(false)
const buttonLoading = ref(false)

const showPageLoading = () => {
  pageLoading.value = true
  setTimeout(() => {
    pageLoading.value = false
  }, 2000)
}

const refreshCard = () => {
  cardLoading.value = true
  setTimeout(() => {
    cardLoading.value = false
  }, 1500)
}

const handleSubmit = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Button @click="showPageLoading">显示全屏加载</Button>
      <Loading v-if="pageLoading" fullscreen text="页面加载中..." />
    </div>
  </div>
</template>
