<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const current = ref(3)
const pageSize = ref(20)
</script>

<template>
  <Pagination
    v-model:current="current"
    v-model:pageSize="pageSize"
    :total="240"
    :page-size-options="[10, 20, 50]"
    show-quick-jumper
    show-size-changer
    show-total />
</template>
