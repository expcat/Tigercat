<script setup lang="ts">
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { MenuItem } from '@expcat/tigercat-vue/MenuItem'
import { SubMenu } from '@expcat/tigercat-vue/SubMenu'
import { ref } from 'vue'
import { Container } from '@expcat/tigercat-vue/Container'

const collapsed = ref(false)
const miniCollapsed = ref(true)
const shellCollapsed = ref(false)
const shellSelectedKeys = ref<(string | number)[]>(['dashboard'])
const shellOpenKeys = ref<(string | number)[]>(['system'])
const dashboardIcon =
  '<span class="inline-flex size-4 items-center justify-center text-[11px]">⌂</span>'
const systemIcon =
  '<span class="inline-flex size-4 items-center justify-center text-[11px]">⚙</span>'
</script>

<template>
  <div class="min-w-0">
    <div class="bg-gray-50 rounded-lg py-6">
      <Container maxWidth="lg">
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <div class="font-medium mb-1">这里是 Container 内容区域</div>
          <div class="text-sm text-gray-600">
            maxWidth=&quot;lg&quot;，默认居中并带有响应式 padding
          </div>
        </div>
      </Container>
    </div>
  </div>
</template>
