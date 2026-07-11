<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@expcat/tigercat-vue/Radio'

const checked = ref(false)
</script>

<template>
  <Radio value="agreement" v-model="checked" size="lg">同意服务条款</Radio>
</template>
