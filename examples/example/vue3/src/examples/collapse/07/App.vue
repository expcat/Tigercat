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
      <Collapse v-model:activeKey="activeKey7">
        <CollapsePanel panelKey="1" header="外层面板 1">
          <Collapse>
            <CollapsePanel panelKey="1-1" header="嵌套面板 1-1">
              <p>这是嵌套的内容。</p>
            </CollapsePanel>
            <CollapsePanel panelKey="1-2" header="嵌套面板 1-2">
              <p>嵌套面板可以有自己独立的状态。</p>
            </CollapsePanel>
          </Collapse>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="外层面板 2">
          <p>普通面板内容。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
