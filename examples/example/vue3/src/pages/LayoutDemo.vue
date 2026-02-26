<script setup lang="ts">
import { ref } from 'vue'
import { Container, Layout, Header, Sidebar, Content, Footer } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const collapsed = ref(false)
const miniCollapsed = ref(true)

const containerSnippet = `<Container maxWidth="lg">
  <div>这里是 Container 内容区域</div>
</Container>`

const basicSnippet = `<Layout>
  <Header>Header</Header>
  <Content>Content</Content>
  <Footer>Footer</Footer>
</Layout>`

const heightSnippet = `<Layout>
  <Header height="48px">Header (48px)</Header>
  <Content>Content</Content>
  <Footer height="64px">Footer (64px)</Footer>
</Layout>`

const sidebarSnippet = `<Layout>
  <Header>Header</Header>
  <div class="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Content>Content</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const collapsedSnippet = `<Layout>
  <Header>Header</Header>
  <div class="flex flex-1">
    <Sidebar width="192px" collapsed-width="64px" :collapsed="collapsed">Sidebar</Sidebar>
    <Content>Content</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const miniSnippet = `<Layout>
  <Header>Header</Header>
  <div class="flex flex-1">
    <Sidebar width="192px" collapsed-width="48px" :collapsed="mini">
      <div v-if="mini" class="text-center">☰</div>
      <div v-else>Full Sidebar</div>
    </Sidebar>
    <Content>Content</Content>
  </div>
</Layout>`

const complexSnippet = `<Layout>
  <Header>Header</Header>
  <div class="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Layout>
      <Content>Content</Content>
      <Footer>Inner Footer</Footer>
    </Layout>
  </div>
  <Footer>Footer</Footer>
</Layout>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Layout 布局</h1>
      <p class="text-gray-600">协助进行页面级整体布局。</p>
    </div>

    <DemoBlock title="Container 容器"
               description="用于约束内容宽度并提供响应式内边距。"
               :code="containerSnippet">
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
    </DemoBlock>

    <DemoBlock title="基础布局"
               description="典型的页面布局。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义高度"
               description="自定义 Header 和 Footer 的高度。"
               :code="heightSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header height="48px" class-name="!bg-blue-600 !text-white !p-4">Header (48px)</Header>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          <Footer height="64px" class-name="!bg-gray-800 !text-white !p-4">Footer (64px)</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock title="侧边栏布局"
               description="带有侧边栏的布局。"
               :code="sidebarSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock title="Sidebar 折叠"
               description="可折叠的侧边栏，通过 collapsed-width 设置折叠后的宽度（默认 64px）。"
               :code="collapsedSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <button class="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
                @click="collapsed = !collapsed">
          {{ collapsed ? '展开侧边栏' : '折叠侧边栏' }}
        </button>
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     collapsed-width="64px"
                     :collapsed="collapsed"
                     class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock title="Mini 模式侧边栏"
               description="collapsed-width 设为更小的值（如 48px）实现 mini 模式，折叠时仅显示图标。"
               :code="miniSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <button class="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
                @click="miniCollapsed = !miniCollapsed">
          {{ miniCollapsed ? '展开' : '折叠为 Mini' }}
        </button>
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     collapsed-width="48px"
                     :collapsed="miniCollapsed"
                     class-name="!bg-gray-200 !p-4">
              <div v-if="miniCollapsed" class="text-center text-xl">☰</div>
              <div v-else>
                <div class="font-medium mb-2">导航菜单</div>
                <div class="text-sm text-gray-600">菜单项 1</div>
                <div class="text-sm text-gray-600">菜单项 2</div>
                <div class="text-sm text-gray-600">菜单项 3</div>
              </div>
            </Sidebar>
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock title="复杂布局"
               description="更复杂的页面布局。"
               :code="complexSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[400px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px"
                     class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Layout class-name="min-h-0 flex-1">
              <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
              <Footer class-name="!bg-gray-100 !p-4">Inner Footer</Footer>
            </Layout>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>
  </div>
</template>
