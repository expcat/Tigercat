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
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <Button @click="openBasic">打开抽屉</Button>
      <Drawer v-model:open="basicVisible" title="基本抽屉">
        <p>这是抽屉的内容</p>
        <p>你可以在这里放置任何内容</p>
        <template #footer>
          <Space>
            <Button variant="secondary" @click="basicVisible = false">关闭</Button>
          </Space>
        </template>
      </Drawer>
    </div>
  </div>
</template>
