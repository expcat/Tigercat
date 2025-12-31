<script setup lang="ts">
import { ref } from 'vue'
import { Drawer, Button, Space, Divider, Icon } from '@tigercat/vue'
import type { DrawerPlacement, DrawerSize } from '@tigercat/core'

// Basic drawer
const basicVisible = ref(false)

// Placement drawers
const placementVisible = ref(false)
const placement = ref<DrawerPlacement>('right')

const showPlacementDrawer = (pos: DrawerPlacement) => {
  placement.value = pos
  placementVisible.value = true
}

// Size drawers
const sizeVisible = ref(false)
const size = ref<DrawerSize>('md')

const showSizeDrawer = (s: DrawerSize) => {
  size.value = s
  sizeVisible.value = true
}

// Custom content drawer
const customVisible = ref(false)

const handleSubmit = () => {
  console.log('提交')
  customVisible.value = false
}

// No mask drawer
const noMaskVisible = ref(false)

// Not closable by mask
const notClosableVisible = ref(false)

// Destroy on close
const destroyVisible = ref(false)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Drawer 抽屉</h1>
      <p class="text-gray-600">从页面边缘滑出的面板，用于展示详细信息或进行操作。</p>
    </div>

    <!-- 基本使用 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本使用</h2>
      <p class="text-gray-600 mb-6">最基本的抽屉使用示例。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="basicVisible = true">打开抽屉</Button>
        <Drawer v-model:visible="basicVisible" title="基本抽屉">
          <p>这是抽屉的内容</p>
          <p>你可以在这里放置任何内容</p>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同位置</h2>
      <p class="text-gray-600 mb-6">通过 <code class="px-1 py-0.5 bg-gray-200 rounded">placement</code> 属性设置抽屉从不同方向弹出。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Button @click="showPlacementDrawer('left')">左侧</Button>
          <Button @click="showPlacementDrawer('right')">右侧</Button>
          <Button @click="showPlacementDrawer('top')">顶部</Button>
          <Button @click="showPlacementDrawer('bottom')">底部</Button>
        </Space>
        <Drawer
          v-model:visible="placementVisible"
          :placement="placement"
          :title="`${placement} 抽屉`"
        >
          <p>从 {{ placement }} 弹出的抽屉</p>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">通过 <code class="px-1 py-0.5 bg-gray-200 rounded">size</code> 属性设置抽屉的大小。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Button @click="showSizeDrawer('sm')">Small</Button>
          <Button @click="showSizeDrawer('md')">Medium</Button>
          <Button @click="showSizeDrawer('lg')">Large</Button>
          <Button @click="showSizeDrawer('xl')">Extra Large</Button>
          <Button @click="showSizeDrawer('full')">Full</Button>
        </Space>
        <Drawer
          v-model:visible="sizeVisible"
          :size="size"
          title="不同尺寸的抽屉"
        >
          <p>尺寸: {{ size }}</p>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义头部和底部 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义头部和底部</h2>
      <p class="text-gray-600 mb-6">使用插槽自定义头部和底部内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="customVisible = true">打开自定义抽屉</Button>
        <Drawer v-model:visible="customVisible">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>⚙️</span>
              <span>设置</span>
            </div>
          </template>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选项 1</label>
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="输入内容" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选项 2</label>
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="输入内容" />
            </div>
          </div>
          
          <template #footer>
            <Space>
              <Button @click="customVisible = false">取消</Button>
              <Button variant="primary" @click="handleSubmit">确定</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 无蒙层 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">无蒙层</h2>
      <p class="text-gray-600 mb-6">设置 <code class="px-1 py-0.5 bg-gray-200 rounded">mask=false</code> 可以不显示遮罩层。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="noMaskVisible = true">打开无蒙层抽屉</Button>
        <Drawer
          v-model:visible="noMaskVisible"
          :mask="false"
          title="无蒙层抽屉"
        >
          <p>这个抽屉没有蒙层</p>
          <p>你可以与页面其他部分交互</p>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 点击蒙层不关闭 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">点击蒙层不关闭</h2>
      <p class="text-gray-600 mb-6">设置 <code class="px-1 py-0.5 bg-gray-200 rounded">mask-closable=false</code> 可以禁止点击蒙层关闭抽屉。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="notClosableVisible = true">打开抽屉</Button>
        <Drawer
          v-model:visible="notClosableVisible"
          :mask-closable="false"
          title="点击蒙层不关闭"
        >
          <p>点击蒙层或按 ESC 键无法关闭</p>
          <p>只能点击关闭按钮</p>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 关闭时销毁 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">关闭时销毁</h2>
      <p class="text-gray-600 mb-6">设置 <code class="px-1 py-0.5 bg-gray-200 rounded">destroy-on-close</code> 可以在关闭时销毁内容，适用于表单重置等场景。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="destroyVisible = true">打开抽屉</Button>
        <Drawer
          v-model:visible="destroyVisible"
          :destroy-on-close="true"
          title="关闭时销毁内容"
        >
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">输入框（关闭后会重置）</label>
              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="尝试输入一些内容，然后关闭抽屉" />
            </div>
          </div>
        </Drawer>
      </div>
    </section>
  </div>
</template>

<style scoped>
code {
  font-family: 'Courier New', Courier, monospace;
}
</style>
