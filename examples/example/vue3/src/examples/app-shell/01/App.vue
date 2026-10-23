<script setup lang="ts">
import { ref } from 'vue'
import { isBrowser } from '@expcat/tigercat-core'
import { AppShell } from '@expcat/tigercat-vue/AppShell'

const routes = [
  { key: 'home', title: 'Home' },
  { key: 'list', title: 'List' }
]
const active = ref('home')
const defaultCollapsed = isBrowser() && window.matchMedia('(max-width: 639px)').matches
</script>

<template>
  <AppShell
    title="Home"
    :default-collapsed="defaultCollapsed"
    header-sticky
    :tabs="routes"
    :active-tab="active"
    :breadcrumb="[{ title: 'Home' }]"
    @tab-change="active = $event">
    <template #sidebar>Menu</template>
    <p>{{ active }}</p>
  </AppShell>
</template>
