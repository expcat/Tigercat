<script setup lang="ts">
import { ref } from 'vue'
import { Button, Spotlight, type SpotlightItem } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const commands: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: '打开仪表盘',
    description: '查看关键指标与待办事项',
    group: '导航',
    keywords: ['home', 'metrics'],
    shortcut: ['⌘', 'D']
  },
  {
    key: 'customers',
    label: '客户列表',
    description: '进入客户管理视图',
    group: '导航',
    keywords: ['crm'],
    shortcut: ['⌘', 'U']
  },
  {
    key: 'invite',
    label: '邀请成员',
    description: '向团队空间添加新成员',
    group: '操作',
    shortcut: ['⌘', 'I']
  },
  {
    key: 'billing',
    label: '账单设置',
    description: '当前计划不允许修改',
    group: '设置',
    disabled: true
  }
]

const open = ref(false)
const controlledOpen = ref(false)
const query = ref('')
const selected = ref('')

const basicSnippet = `<Button @click="open = true">打开命令面板</Button>
<Spotlight
  v-model:open="open"
  :items="commands"
  title="命令面板"
  placeholder="搜索页面或操作"
  @select="(item) => selected = item.label"
/>`

const controlledSnippet = `<Spotlight
  v-model:open="open"
  v-model:query="query"
  :items="commands"
  :close-on-select="false"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Spotlight 命令面板</h1>
    <p class="text-gray-500 mb-8">支持分组结果、模糊搜索与键盘导航的命令面板。</p>

    <DemoBlock title="基本用法" description="通过 open 控制命令面板显示状态" :code="basicSnippet">
      <div class="flex flex-wrap items-center gap-3">
        <Button @click="open = true">打开命令面板</Button>
        <span v-if="selected" class="text-sm text-gray-500">已选择：{{ selected }}</span>
      </div>
      <Spotlight
        v-model:open="open"
        :items="commands"
        title="命令面板"
        placeholder="搜索页面或操作"
        empty-text="没有匹配命令"
        @select="(item) => (selected = item.label)" />
    </DemoBlock>

    <DemoBlock
      title="受控搜索"
      description="query 与 open 都可以完全受控"
      :code="controlledSnippet">
      <div class="flex flex-wrap items-center gap-3">
        <Button variant="outline" @click="controlledOpen = true">打开受控面板</Button>
        <span class="text-sm text-gray-500">当前查询：{{ query || '空' }}</span>
      </div>
      <Spotlight
        v-model:open="controlledOpen"
        v-model:query="query"
        :items="commands"
        title="受控命令面板"
        placeholder="输入 help、crm 或设置"
        :close-on-select="false" />
    </DemoBlock>
  </div>
</template>
