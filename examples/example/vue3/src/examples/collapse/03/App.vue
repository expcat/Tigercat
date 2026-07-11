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
      <Collapse :bordered="false" v-model:activeKey="activeKey3">
        <CollapsePanel panelKey="1" header="无边框面板 1">
          <p>这是无边框面板的内容。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="无边框面板 2">
          <p>外观更加简洁。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
