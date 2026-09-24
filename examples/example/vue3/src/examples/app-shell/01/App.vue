<script setup lang="ts">
import { ref } from 'vue'
import { AppShell } from '@expcat/tigercat-vue'

const routes = [
  { key: 'home', title: 'Home' },
  { key: 'list', title: 'List' }
]
const active = ref('home')
</script>

<template>
  <AppShell
    title="Home"
    header-sticky
    :tabs="routes"
    :active-tab="active"
    :breadcrumb="[{ title: 'Home' }]"
    @tab-change="active = $event"
  >
    <template #sidebar>Menu</template>
    <p>{{ active }}</p>
  </AppShell>
</template>
