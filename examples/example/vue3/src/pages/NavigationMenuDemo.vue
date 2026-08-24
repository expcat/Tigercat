<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('navigation-menu')
</script>

<template>
  <DemoPage
    title="NavigationMenu 站点导航"
    description="水平导航栏配合下拉与 MegaMenu 面板，悬停或键盘展开，使用 menubar 语义。"
    :modules="modules" />
</template>
