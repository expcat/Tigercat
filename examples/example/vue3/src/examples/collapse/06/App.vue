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
      <Collapse v-model:activeKey="activeKey6">
        <CollapsePanel panelKey="1" header="正常面板">
          <p>这个面板可以正常展开和折叠。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="禁用面板" disabled>
          <p>这个面板被禁用，无法展开。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="3" header="另一个正常面板">
          <p>这个面板也可以正常使用。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
