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
      <Collapse v-model:activeKey="activeKey1">
        <CollapsePanel panelKey="1" header="面板标题 1">
          <p>这是面板 1 的内容。可以包含任意 HTML 元素。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="面板标题 2">
          <p>这是面板 2 的内容。折叠面板适合用于展示大量信息。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="3" header="面板标题 3">
          <p>这是面板 3 的内容。每个面板可以独立展开或折叠。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
