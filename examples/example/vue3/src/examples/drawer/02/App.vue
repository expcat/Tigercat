<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { defineComponent, h, ref } from 'vue'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import type { DrawerPlacement, DrawerSize } from '@expcat/tigercat-vue'

// Basic drawer
const basicVisible = ref(false)

// Placement drawers
const placementVisible = ref(false)
const placement = ref<DrawerPlacement>('right')

// Size drawers
const sizeVisible = ref(false)
const size = ref<DrawerSize>('md')
const customPaddingVisible = ref(false)

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

// Custom text via labels (no i18n)
const labelsVisible = ref(false)

const closeAll = () => {
  basicVisible.value = false
  placementVisible.value = false
  sizeVisible.value = false
  customPaddingVisible.value = false
  customVisible.value = false
  noMaskVisible.value = false
  notClosableVisible.value = false
  noCloseButtonVisible.value = false
  destroyVisible.value = false
  labelsVisible.value = false
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

const showCustomPaddingDrawer = () => {
  closeAll()
  customPaddingVisible.value = true
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

const openLabels = () => {
  closeAll()
  labelsVisible.value = true
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
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <Space>
            <Button
              :variant="placement === 'left' ? 'primary' : 'secondary'"
              @click="showPlacementDrawer('left')"
              >左侧</Button
            >
            <Button
              :variant="placement === 'right' ? 'primary' : 'secondary'"
              @click="showPlacementDrawer('right')"
              >右侧</Button
            >
            <Button
              :variant="placement === 'top' ? 'primary' : 'secondary'"
              @click="showPlacementDrawer('top')"
              >顶部</Button
            >
            <Button
              :variant="placement === 'bottom' ? 'primary' : 'secondary'"
              @click="showPlacementDrawer('bottom')"
              >底部</Button
            >
          </Space>
          <Drawer
            v-model:open="placementVisible"
            :placement="placement"
            :title="`${placement} 抽屉`">
            <p>从 {{ placement }} 弹出的抽屉</p>
            <template #footer>
              <Space>
                <Button variant="secondary" @click="placementVisible = false">关闭</Button>
              </Space>
            </template>
          </Drawer>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸与内边距</h3>
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <Space>
            <Button
              :variant="!customPaddingVisible && size === 'sm' ? 'primary' : 'secondary'"
              @click="showSizeDrawer('sm')"
              >小 (sm)</Button
            >
            <Button
              :variant="!customPaddingVisible && size === 'md' ? 'primary' : 'secondary'"
              @click="showSizeDrawer('md')"
              >中 (md)</Button
            >
            <Button
              :variant="!customPaddingVisible && size === 'lg' ? 'primary' : 'secondary'"
              @click="showSizeDrawer('lg')"
              >大 (lg)</Button
            >
            <Button
              :variant="!customPaddingVisible && size === 'xl' ? 'primary' : 'secondary'"
              @click="showSizeDrawer('xl')"
              >超大 (xl)</Button
            >
            <Button
              :variant="!customPaddingVisible && size === 'full' ? 'primary' : 'secondary'"
              @click="showSizeDrawer('full')"
              >全屏 (full)</Button
            >
            <Button
              :variant="customPaddingVisible ? 'primary' : 'secondary'"
              @click="showCustomPaddingDrawer"
              >自定义内边距 (p-10)</Button
            >
          </Space>
          <Drawer v-model:open="sizeVisible" :size="size" title="不同尺寸的抽屉">
            <p>尺寸: {{ size }}</p>
            <template #footer>
              <Space>
                <Button variant="secondary" @click="sizeVisible = false">关闭</Button>
              </Space>
            </template>
          </Drawer>
          <Drawer
            v-model:open="customPaddingVisible"
            body-padding="p-10"
            title="自定义内容内边距 (p-10)">
            <p>这个抽屉的主体内容区域使用了 body-padding="p-10" 属性，内边距比默认情况更大。</p>
            <template #footer>
              <Space>
                <Button variant="secondary" @click="customPaddingVisible = false">关闭</Button>
              </Space>
            </template>
          </Drawer>
        </div>
      </div>
    </div>
  </div>
</template>
