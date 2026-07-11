<script setup lang="ts">
import { ref } from 'vue'
import { Collapse } from '@expcat/tigercat-vue/Collapse'
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'

const activeKey = ref<string | number | undefined>('faq-1')
</script>

<template>
  <Collapse v-model:activeKey="activeKey" accordion>
    <CollapsePanel panel-key="faq-1" header="如何安装？">
      使用包管理器安装对应的 Vue 包。
    </CollapsePanel>
    <CollapsePanel panel-key="faq-2" header="是否支持暗色主题？">
      支持，并可通过 ConfigProvider 统一配置。
    </CollapsePanel>
  </Collapse>
</template>
