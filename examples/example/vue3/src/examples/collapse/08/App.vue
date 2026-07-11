<script setup lang="ts">
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'
import { ref } from 'vue'
import { Collapse } from '@expcat/tigercat-vue/Collapse'

const activeKey1 = ref<string[]>(['1'])
const activeKey2 = ref<string | undefined>('1')
const activeKey3 = ref<string[]>([])
const activeKey4 = ref<string[]>([])
const activeKey5 = ref<string[]>([])
const activeKey6 = ref<string[]>([])
const activeKey7 = ref<string[]>(['1'])
const activeKey8 = ref<string[]>([])
const activeKey9 = ref<string[]>([])
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Collapse v-model:activeKey="activeKey8">
        <CollapsePanel panelKey="1">
          <template #header>
            <span class="font-bold text-blue-600">🎨 自定义标题</span>
          </template>
          <template #extra>
            <span class="text-xs text-gray-400">额外内容</span>
          </template>
          <p>使用 slot 可以完全自定义面板标题和右侧额外内容。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2">
          <template #header>
            <span class="font-bold text-green-600">📝 另一个自定义标题</span>
          </template>
          <p>每个面板都可以有不同的自定义标题样式。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
