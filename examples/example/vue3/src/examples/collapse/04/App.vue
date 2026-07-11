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
    <div class="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <Collapse ghost v-model:activeKey="activeKey4">
        <CollapsePanel panelKey="1" header="Ghost 面板 1">
          <p>Ghost 模式的面板没有背景色，适合放在有背景的容器中。</p>
        </CollapsePanel>
        <CollapsePanel panelKey="2" header="Ghost 面板 2">
          <p>可以更好地融入页面设计。</p>
        </CollapsePanel>
      </Collapse>
    </div>
  </div>
</template>
