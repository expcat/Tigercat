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
      <Collapse v-model:activeKey="activeKey9">
        <CollapsePanel panelKey="1" header="无箭头面板 1" :showArrow="false">
          <p>不显示展开/收起箭头图标。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="无箭头面板 2" :showArrow="false">
          <p>所有面板都隐藏了箭头。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
