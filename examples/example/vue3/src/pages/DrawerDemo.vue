<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { Drawer, Button, Space } from '@expcat/tigercat-vue'
import type { DrawerPlacement, DrawerSize } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

// No close button
const noCloseButtonVisible = ref(false)

// Destroy on close
const destroyVisible = ref(false)

const closeAll = () => {
  basicVisible.value = false
  placementVisible.value = false
  sizeVisible.value = false
  customVisible.value = false
  noMaskVisible.value = false
  notClosableVisible.value = false
  noCloseButtonVisible.value = false
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

const openNoCloseButton = () => {
  closeAll()
  noCloseButtonVisible.value = true
}

const openDestroy = () => {
  closeAll()
  destroyVisible.value = true
}

const basicSnippet = `<Button @click="openBasic">打开抽屉</Button>
<Drawer v-model:visible="basicVisible" title="基本抽屉">
  <p>这是抽屉的内容</p>
  <p>你可以在这里放置任何内容</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="basicVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const placementSnippet = `<Space>
  <Button :variant="placement === 'left' ? 'primary' : 'secondary'" @click="showPlacementDrawer('left')">左侧</Button>
  <Button :variant="placement === 'right' ? 'primary' : 'secondary'" @click="showPlacementDrawer('right')">右侧</Button>
  <Button :variant="placement === 'top' ? 'primary' : 'secondary'" @click="showPlacementDrawer('top')">顶部</Button>
  <Button :variant="placement === 'bottom' ? 'primary' : 'secondary'" @click="showPlacementDrawer('bottom')">底部</Button>
</Space>
<Drawer v-model:visible="placementVisible" :placement="placement" :title="\`\${placement} 抽屉\`">
  <p>从 {{ placement }} 弹出的抽屉</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="placementVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const sizeSnippet = `<Space>
  <Button :variant="size === 'sm' ? 'primary' : 'secondary'" @click="showSizeDrawer('sm')">小 (sm)</Button>
  <Button :variant="size === 'md' ? 'primary' : 'secondary'" @click="showSizeDrawer('md')">中 (md)</Button>
  <Button :variant="size === 'lg' ? 'primary' : 'secondary'" @click="showSizeDrawer('lg')">大 (lg)</Button>
  <Button :variant="size === 'xl' ? 'primary' : 'secondary'" @click="showSizeDrawer('xl')">超大 (xl)</Button>
  <Button :variant="size === 'full' ? 'primary' : 'secondary'" @click="showSizeDrawer('full')">全屏 (full)</Button>
</Space>
<Drawer v-model:visible="sizeVisible" :size="size" title="不同尺寸的抽屉">
  <p>尺寸: {{ size }}</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="sizeVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const customSnippet = `<Button @click="openCustom">打开自定义抽屉</Button>
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
</Drawer>`

const noMaskSnippet = `<Button @click="openNoMask">打开无蒙层抽屉</Button>
<Drawer v-model:visible="noMaskVisible" :mask="false" title="无蒙层抽屉">
  <p>这个抽屉没有蒙层</p>
  <p>你可以与页面其他部分交互</p>
  <p class="mt-2 text-sm text-gray-500">建议仍保留明确的关闭入口（关闭按钮/ESC）。</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="noMaskVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const notClosableSnippet = `<Button @click="openNotClosable">打开抽屉</Button>
<Drawer v-model:visible="notClosableVisible" :mask-closable="false" title="点击蒙层不关闭">
  <p>点击蒙层不会关闭</p>
  <p class="mt-2">仍可使用关闭按钮或按 ESC 关闭</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="notClosableVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const noCloseButtonSnippet = `<Button @click="openNoCloseButton">打开抽屉</Button>
<Drawer v-model:visible="noCloseButtonVisible" :closable="false" title="隐藏关闭按钮">
  <p>这个抽屉没有关闭按钮</p>
  <p class="mt-2">仍可使用 ESC 或底部按钮关闭</p>
  <template #footer>
    <Space>
      <Button variant="secondary" @click="noCloseButtonVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

const destroySnippet = `<Button @click="openDestroy">打开抽屉</Button>
<Drawer v-model:visible="destroyVisible" :destroy-on-close="true" title="关闭时销毁内容">
  <DestroyOnCloseContent />
  <template #footer>
    <Space>
      <Button variant="secondary" @click="destroyVisible = false">关闭</Button>
    </Space>
  </template>
</Drawer>`

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
            placeholder: '尝试输入一些内容，然后关闭抽屉'
          })
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
                  }
                },
                { default: () => '计数 +1' }
              ),
              h(
                Button,
                {
                  variant: 'secondary',
                  onClick: () => {
                    value.value = ''
                  }
                },
                { default: () => '清空输入' }
              )
            ]
          }
        )
      ])
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Drawer 抽屉</h1>
      <p class="text-gray-600">从页面边缘滑出的面板，用于展示详细信息或进行操作。</p>
    </div>

    <!-- 基本使用 -->
    <DemoBlock title="基本使用"
               description="最基本的抽屉使用示例。"
               :code="basicSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 不同位置 -->
    <DemoBlock title="不同位置"
               description="通过 placement 属性设置抽屉从不同方向弹出。"
               :code="placementSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸"
               description="通过 size 属性设置抽屉的大小。"
               :code="sizeSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 自定义头部和底部 -->
    <DemoBlock title="自定义头部和底部"
               description="使用插槽自定义头部和底部内容。"
               :code="customSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 无蒙层 -->
    <DemoBlock title="无蒙层"
               description="设置 mask=false 可以不显示遮罩层。"
               :code="noMaskSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 点击蒙层不关闭 -->
    <DemoBlock title="点击蒙层不关闭"
               description="设置 mask-closable=false 可以禁止点击蒙层关闭抽屉。"
               :code="notClosableSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>

    <!-- 隐藏关闭按钮 -->
    <DemoBlock title="隐藏关闭按钮"
               description="设置 closable=false 可以隐藏关闭按钮。"
               :code="noCloseButtonSnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Button @click="openNoCloseButton">打开抽屉</Button>
        <Drawer v-model:visible="noCloseButtonVisible"
                :closable="false"
                title="隐藏关闭按钮">
          <p>这个抽屉没有关闭按钮</p>
          <p class="mt-2">仍可使用 ESC 或底部按钮关闭</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="noCloseButtonVisible = false">关闭</Button>
            </Space>
          </template>
        </Drawer>
      </div>
    </DemoBlock>

    <!-- 关闭时销毁 -->
    <DemoBlock title="关闭时销毁"
               description="设置 destroy-on-close 可以在关闭时销毁内容，适用于表单重置等场景。"
               :code="destroySnippet">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
    </DemoBlock>
  </div>
</template>
