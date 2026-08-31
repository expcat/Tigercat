<script setup lang="ts">
import { ref } from 'vue'
import { Collapse } from '@expcat/tigercat-vue/Collapse'
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'

const activeKey = ref<(string | number)[]>(['faq-1'])
</script>

<template>
  <div class="space-y-6">
    <Collapse v-model:active-key="activeKey" accordion>
      <CollapsePanel panel-key="faq-1" header="如何安装？">
        使用包管理器安装对应的 Vue 包。
      </CollapsePanel>
      <CollapsePanel panel-key="faq-2" header="是否支持暗色主题？">
        支持，并可通过 ConfigProvider 统一配置。
      </CollapsePanel>
    </Collapse>
    <Collapse :default-active-key="['a', 'b']">
      <CollapsePanel panel-key="a" header="可以同时打开">
        非手风琴模式下多块面板能一起展开。
      </CollapsePanel>
      <CollapsePanel panel-key="b" header="另一块也开着">
        关闭手风琴后，点开不会收起其它面板。
      </CollapsePanel>
    </Collapse>
  </div>
</template>
