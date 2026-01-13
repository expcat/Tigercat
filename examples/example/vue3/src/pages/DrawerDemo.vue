<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { Drawer, Button, Space, Divider } from '@tigercat/vue'
import type { DrawerPlacement, DrawerSize } from '@tigercat/vue'

// Basic drawer
const basicVisible = ref(false)

// Placement drawers
const placementVisible = ref(false)
const placement = ref<DrawerPlacement>('right')

// Size drawers
const sizeVisible = ref(false)
const size = ref<DrawerSize>('md')

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

const closeAll = () => {
  basicVisible.value = false
  placementVisible.value = false
  sizeVisible.value = false
  customVisible.value = false
  noMaskVisible.value = false
  notClosableVisible.value = false
  destroyVisible.value = false
}

const openBasic = () => {
  closeAll()
  basicVisible.value = true
}

const showPlacementDrawer = (pos: DrawerPlacement) => {
  closeAll()
  placement.value = pos
  placementVisible.value = true
}

const showSizeDrawer = (s: DrawerSize) => {
  closeAll()
  size.value = s
  sizeVisible.value = true
}

const openCustom = () => {
  closeAll()
  customVisible.value = true
}

const openNoMask = () => {
  closeAll()
  noMaskVisible.value = true
}

const openNotClosable = () => {
  closeAll()
  notClosableVisible.value = true
}

const openDestroy = () => {
  closeAll()
  destroyVisible.value = true
}

const DestroyOnCloseContent = defineComponent({
  name: 'DestroyOnCloseContent',
  setup() {
    const value = ref('')
    const count = ref(0)

    return () =>
      h('div', { class: 'space-y-4' }, [
        h(
          'p',
          { class: 'text-sm text-gray-600' },
          `这个区域的内部状态会在关闭后重置（示例计数：${count.value}）`
        ),
        h('div', {}, [
          h(
            'label',
            { class: 'block text-sm font-medium text-gray-700 mb-2' },
            '输入框（关闭后会重置）'
          ),
          h('input', {
            type: 'text',
            value: value.value,
            onInput: (e: Event) => {
              value.value = (e.target as HTMLInputElement).value
            },
            class: 'w-full px-3 py-2 border border-gray-300 rounded-md',
            placeholder: '尝试输入一些内容，然后关闭抽屉',
          }),
        ]),
        h(
          Space,
          {},
          {
            default: () => [
              h(
                Button,
                {
                  variant: 'secondary',
                  onClick: () => {
                    count.value += 1
                  },
                },
                { default: () => '计数 +1' }
              ),
              h(
                Button,
                {
                  variant: 'secondary',
                  onClick: () => {
                    value.value = ''
                  },
                },
                { default: () => '清空输入' }
              ),
            ],
          }
        ),
      ])
  },
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Drawer 抽屉</h1>
      <p class="text-gray-600">从页面边缘滑出的面板，用于展示详细信息或进行操作。</p>
    </div>

    <!-- 基本使用 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本使用</h2>
      <p class="text-gray-600 mb-6">最基本的抽屉使用示例。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="openBasic">打开抽屉</Button>
        <Drawer v-model:visible="basicVisible"
                title="基本抽屉">
          <p>这是抽屉的内容</p>
          <p>你可以在这里放置任何内容</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="basicVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同位置</h2>
      <p class="text-gray-600 mb-6">通过 <code class="px-1 py-0.5 bg-gray-200 rounded">placement</code> 属性设置抽屉从不同方向弹出。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Space>
          <Button :variant="placement === 'left' ? 'primary' : 'secondary'"
                  @click="showPlacementDrawer('left')">左侧</Button>
          <Button :variant="placement === 'right' ? 'primary' : 'secondary'"
                  @click="showPlacementDrawer('right')">右侧</Button>
          <Button :variant="placement === 'top' ? 'primary' : 'secondary'"
                  @click="showPlacementDrawer('top')">顶部</Button>
          <Button :variant="placement === 'bottom' ? 'primary' : 'secondary'"
                  @click="showPlacementDrawer('bottom')">底部</Button>
        </Space>
        <Drawer v-model:visible="placementVisible"
                :placement="placement"
                :title="`${placement} 抽屉`">
          <p>从 {{ placement }} 弹出的抽屉</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="placementVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">通过 <code class="px-1 py-0.5 bg-gray-200 rounded">size</code> 属性设置抽屉的大小。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Space>
          <Button :variant="size === 'sm' ? 'primary' : 'secondary'"
                  @click="showSizeDrawer('sm')">小 (sm)</Button>
          <Button :variant="size === 'md' ? 'primary' : 'secondary'"
                  @click="showSizeDrawer('md')">中 (md)</Button>
          <Button :variant="size === 'lg' ? 'primary' : 'secondary'"
                  @click="showSizeDrawer('lg')">大 (lg)</Button>
          <Button :variant="size === 'xl' ? 'primary' : 'secondary'"
                  @click="showSizeDrawer('xl')">超大 (xl)</Button>
          <Button :variant="size === 'full' ? 'primary' : 'secondary'"
                  @click="showSizeDrawer('full')">全屏 (full)</Button>
        </Space>
        <Drawer v-model:visible="sizeVisible"
                :size="size"
                title="不同尺寸的抽屉">
          <p>尺寸: {{ size }}</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="sizeVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义头部和底部 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义头部和底部</h2>
      <p class="text-gray-600 mb-6">使用插槽自定义头部和底部内容。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="openCustom">打开自定义抽屉</Button>
        <Drawer v-model:visible="customVisible">
          <template #header>
            <div class="flex items-center gap-2">
              <span>⚙️</span>
              <span>设置</span>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选项 1</label>
              <input type="text"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md"
                     placeholder="输入内容" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选项 2</label>
              <input type="text"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md"
                     placeholder="输入内容" />
            </div>
          </div>

          <template #footer>
            <Space>
              <Button @click="customVisible = false">取消</Button>
              <Button variant="primary"
                      @click="handleSubmit">确定</Button>
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
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="openNoMask">打开无蒙层抽屉</Button>
        <Drawer v-model:visible="noMaskVisible"
                :mask="false"
                title="无蒙层抽屉">
          <p>这个抽屉没有蒙层</p>
          <p>你可以与页面其他部分交互</p>
          <p class="mt-2 text-sm text-gray-500">建议仍保留明确的关闭入口（关闭按钮/ESC）。</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="noMaskVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 点击蒙层不关闭 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">点击蒙层不关闭</h2>
      <p class="text-gray-600 mb-6">设置 <code class="px-1 py-0.5 bg-gray-200 rounded">mask-closable=false</code>
        可以禁止点击蒙层关闭抽屉。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="openNotClosable">打开抽屉</Button>
        <Drawer v-model:visible="notClosableVisible"
                :mask-closable="false"
                title="点击蒙层不关闭">
          <p>点击蒙层不会关闭</p>
          <p class="mt-2">仍可使用关闭按钮或按 ESC 关闭</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="notClosableVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 关闭时销毁 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">关闭时销毁</h2>
      <p class="text-gray-600 mb-6">设置 <code class="px-1 py-0.5 bg-gray-200 rounded">destroy-on-close</code>
        可以在关闭时销毁内容，适用于表单重置等场景。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="openDestroy">打开抽屉</Button>
        <Drawer v-model:visible="destroyVisible"
                :destroy-on-close="true"
                title="关闭时销毁内容">
          <DestroyOnCloseContent />
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="destroyVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
    </section>
  </div>
</template>
