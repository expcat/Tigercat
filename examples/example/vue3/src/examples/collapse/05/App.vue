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
      <Collapse expandIconPosition="end" v-model:activeKey="activeKey5">
        <CollapsePanel panelKey="1" header="箭头在右侧">
          <p>展开图标位于面板标题的右侧。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="另一个面板">
          <p>所有面板的图标位置保持一致。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
