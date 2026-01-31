<script setup lang="ts">
import { ref } from 'vue'
import { Collapse, CollapsePanel } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Collapse v-model:activeKey="activeKey">
  <CollapsePanel panelKey="1" header="面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="面板 2">内容 2</CollapsePanel>
</Collapse>`

const accordionSnippet = `<Collapse accordion v-model:activeKey="activeKey">
  <CollapsePanel panelKey="1" header="面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="面板 2">内容 2</CollapsePanel>
</Collapse>`

const borderlessSnippet = `<Collapse :bordered="false">
  <CollapsePanel panelKey="1" header="无边框面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="无边框面板 2">内容 2</CollapsePanel>
</Collapse>`

const ghostSnippet = `<Collapse ghost>
  <CollapsePanel panelKey="1" header="透明背景面板 1">内容 1</CollapsePanel>
  <CollapsePanel panelKey="2" header="透明背景面板 2">内容 2</CollapsePanel>
</Collapse>`

const iconPositionSnippet = `<Collapse expandIconPosition="end">
  <CollapsePanel panelKey="1" header="箭头在右侧">内容</CollapsePanel>
</Collapse>`

const disabledSnippet = `<Collapse>
  <CollapsePanel panelKey="1" header="正常面板">可展开</CollapsePanel>
  <CollapsePanel panelKey="2" header="禁用面板" disabled>不可展开</CollapsePanel>
</Collapse>`

const nestedSnippet = `<Collapse>
  <CollapsePanel panelKey="1" header="外层面板">
    <Collapse>
      <CollapsePanel panelKey="1-1" header="嵌套面板 1">嵌套内容 1</CollapsePanel>
      <CollapsePanel panelKey="1-2" header="嵌套面板 2">嵌套内容 2</CollapsePanel>
    </Collapse>
  </CollapsePanel>
</Collapse>`

const activeKey1 = ref<string[]>(['1'])
const activeKey2 = ref<string | undefined>('1')
const activeKey3 = ref<string[]>([])
const activeKey4 = ref<string[]>([])
const activeKey5 = ref<string[]>([])
const activeKey6 = ref<string[]>([])
const activeKey7 = ref<string[]>(['1'])
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Collapse 折叠面板</h1>
      <p class="text-gray-600">可以折叠/展开的内容区域，用于将复杂的区域折叠起来。</p>
    </div>

    <DemoBlock title="基本用法" description="可以同时展开多个面板。" :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Collapse v-model:activeKey="activeKey1">
          <CollapsePanel panelKey="1" header="面板标题 1">
            <p>这是面板 1 的内容。可以包含任意 HTML 元素。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="面板标题 2">
            <p>这是面板 2 的内容。折叠面板适合用于展示大量信息。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="面板标题 3">
            <p>这是面板 3 的内容。每个面板可以独立展开或折叠。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </DemoBlock>

    <DemoBlock
      title="手风琴模式"
      description="每次只能展开一个面板。"
      :code="accordionSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Collapse accordion v-model:activeKey="activeKey2">
          <CollapsePanel panelKey="1" header="手风琴面板 1">
            <p>手风琴模式下，展开一个面板会自动收起其他面板。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="手风琴面板 2">
            <p>适合用于 FAQ 或者步骤指南等场景。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="手风琴面板 3">
            <p>点击其他面板时，当前面板会自动收起。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </DemoBlock>

    <DemoBlock title="无边框" description="简洁的无边框样式。" :code="borderlessSnippet">
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
    </DemoBlock>

    <DemoBlock title="透明背景" description="背景透明的 Ghost 模式。" :code="ghostSnippet">
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
    </DemoBlock>

    <DemoBlock
      title="图标位置"
      description="可以将展开图标放在右侧。"
      :code="iconPositionSnippet">
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
    </DemoBlock>

    <DemoBlock title="禁用面板" description="可以禁用某个面板。" :code="disabledSnippet">
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
    </DemoBlock>

    <DemoBlock title="嵌套面板" description="折叠面板可以嵌套使用。" :code="nestedSnippet">
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
    </DemoBlock>
  </div>
</template>
