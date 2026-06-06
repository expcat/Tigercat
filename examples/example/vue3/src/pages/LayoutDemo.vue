<script setup lang="ts">
import { ref } from 'vue'
import { Container, Layout, Header, Sidebar, Content, Footer } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const collapsed = ref(false)
const miniCollapsed = ref(true)
const shellCollapsed = ref(false)

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

const collapsedScriptSnippet = `import { ref } from 'vue'

const collapsed = ref(false)`

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

const shellSidebarSnippet = `const collapsed = ref(false)

<Sidebar width="240px" collapsed-width="64px" :collapsed="collapsed">
  <div class="flex h-full flex-col">
    <div class="flex items-center gap-3 px-4 py-4">
      <span class="grid size-8 place-items-center rounded-lg bg-[var(--tiger-primary,#2563eb)] text-white">T</span>
      <span :class="collapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-32 opacity-100 translate-x-0'">
        Tigercat Admin
      </span>
    </div>
    <button @click="collapsed = !collapsed">
      <span>{{ collapsed ? '>' : '<' }}</span>
      <span :class="collapsed ? 'max-w-0 opacity-0 translate-x-2' : 'max-w-32 opacity-100 translate-x-0'">
        {{ collapsed ? '展开侧栏' : '收起侧栏' }}
      </span>
    </button>
  </div>
</Sidebar>`

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
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Layout 布局</h1>
      <p class="text-gray-600 dark:text-gray-400">协助进行页面级整体布局。</p>
    </div>

    <DemoBlock
      title="Container 容器"
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

    <DemoBlock title="基础布局" description="典型的页面布局。" :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock
      title="自定义高度"
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

    <DemoBlock title="侧边栏布局" description="带有侧边栏的布局。" :code="sidebarSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px" class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock
      title="Sidebar 折叠"
      description="可折叠的侧边栏，通过 collapsed-width 设置折叠后的宽度（默认 64px）。"
      :code="collapsedSnippet"
      :script="collapsedScriptSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <button
          class="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
          @click="collapsed = !collapsed">
          {{ collapsed ? '展开侧边栏' : '折叠侧边栏' }}
        </button>
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar
              width="192px"
              collapsed-width="64px"
              :collapsed="collapsed"
              class-name="!bg-gray-200 !p-4"
              >Sidebar</Sidebar
            >
            <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
          </div>
          <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock
      title="后台 Shell 侧栏"
      description="推荐使用 Sidebar 的 collapsed-width 配合文案 max-width、opacity、transform transition，让 Logo 文案和底部折叠按钮在收缩时平滑淡出。"
      :code="shellSidebarSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[320px]">
          <Sidebar
            width="240px"
            collapsed-width="64px"
            :collapsed="shellCollapsed"
            class-name="!bg-white !p-0">
            <div class="flex h-full flex-col">
              <div
                class="flex items-center gap-3 border-b border-[var(--tiger-border,#e5e7eb)] px-4 py-4">
                <span
                  class="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--tiger-primary,#2563eb)] text-sm font-semibold text-white">
                  T
                </span>
                <span
                  :class="[
                    'overflow-hidden whitespace-nowrap text-sm font-semibold text-[var(--tiger-text,#111827)] transition-[max-width,opacity,transform] duration-300',
                    shellCollapsed
                      ? 'max-w-0 -translate-x-2 opacity-0'
                      : 'max-w-32 translate-x-0 opacity-100'
                  ]">
                  Tigercat Admin
                </span>
              </div>
              <div class="flex-1 px-2 py-3">
                <div
                  class="rounded-lg bg-[var(--tiger-surface-muted,#f9fafb)] px-3 py-2 text-sm text-[var(--tiger-text-muted,#6b7280)]">
                  {{ shellCollapsed ? 'D' : 'Dashboard' }}
                </div>
              </div>
              <button
                type="button"
                class="m-3 flex items-center justify-center gap-2 rounded-lg border border-[var(--tiger-border,#e5e7eb)] px-2 py-2 text-sm text-[var(--tiger-text,#111827)] transition-colors hover:bg-[var(--tiger-surface-muted,#f9fafb)]"
                @click="shellCollapsed = !shellCollapsed">
                <span class="shrink-0">{{ shellCollapsed ? '>' : '<' }}</span>
                <span
                  :class="[
                    'overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300',
                    shellCollapsed
                      ? 'max-w-0 translate-x-2 opacity-0'
                      : 'max-w-32 translate-x-0 opacity-100'
                  ]">
                  {{ shellCollapsed ? '展开侧栏' : '收起侧栏' }}
                </span>
              </button>
            </div>
          </Sidebar>
          <Content class-name="!bg-white !p-6">
            <div
              class="rounded-xl border border-dashed border-[var(--tiger-border,#e5e7eb)] p-6 text-sm text-[var(--tiger-text-muted,#6b7280)]">
              Shell 内容区域
            </div>
          </Content>
        </Layout>
      </div>
    </DemoBlock>

    <DemoBlock
      title="Mini 模式侧边栏"
      description="collapsed-width 设为更小的值（如 48px）实现 mini 模式，折叠时仅显示图标。"
      :code="miniSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <button
          class="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
          @click="miniCollapsed = !miniCollapsed">
          {{ miniCollapsed ? '展开' : '折叠为 Mini' }}
        </button>
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar
              width="192px"
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

    <DemoBlock title="复杂布局" description="更复杂的页面布局。" :code="complexSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Layout class-name="border border-gray-300 overflow-hidden min-h-[400px]">
          <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
          <div class="flex flex-1">
            <Sidebar width="192px" class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
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
