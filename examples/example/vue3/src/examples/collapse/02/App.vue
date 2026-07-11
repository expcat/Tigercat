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
      <Collapse accordion v-model:activeKey="activeKey2">
        <CollapsePanel panelKey="1" header="手风琴面板 1">
          <p>手风琴模式下，展开一个面板会自动收起其他面板。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="手风琴面板 2">
          <p>适合用于 FAQ 或者步骤指南等场景。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="3" header="手风琴面板 3">
          <p>点击其他面板时，当前面板会自动收起。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
