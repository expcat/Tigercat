<script setup lang="ts">
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'
</script>

<template>
  <Layout class="min-h-64 overflow-hidden rounded border border-gray-300">
    <Header class="!bg-blue-600 !p-4 !text-white">Header</Header>
    <Content class="!bg-white !p-4">Content</Content>
    <Footer class="!bg-gray-800 !p-4 !text-white">Footer</Footer>
  </Layout>
</template>
