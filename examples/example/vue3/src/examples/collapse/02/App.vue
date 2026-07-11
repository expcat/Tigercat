<script setup lang="ts">
import { Collapse } from '@expcat/tigercat-vue/Collapse'
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'
</script>

<template>
  <Collapse :default-active-key="['outer']">
    <CollapsePanel panel-key="outer" header="外层面板">
      <Collapse :default-active-key="['inner']">
        <CollapsePanel panel-key="inner" header="嵌套面板">
          嵌套内容拥有独立的展开状态。
        </CollapsePanel>
      </Collapse>
    </CollapsePanel>
  </Collapse>
</template>
