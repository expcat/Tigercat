<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const page = ref(1)
</script>

<template>
  <Pagination v-model:current="page" :total="200" ellipsis-jump />
</template>
