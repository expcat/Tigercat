<script setup lang="ts">
import { ref } from 'vue'
import { Textarea, Space, FormItem } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const text = ref('')
const autoResizeText = ref('')
const limited = ref('')
const combined = ref('')

const basicSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Textarea v-model="text" placeholder="请输入内容" :rows="4" />
  <p class="text-sm text-gray-600">输入的内容：{{ text }}</p>
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="Small">
    <Textarea size="sm" placeholder="Small textarea" />
  </FormItem>
  <FormItem label="Medium">
    <Textarea size="md" placeholder="Medium textarea" />
  </FormItem>
  <FormItem label="Large">
    <Textarea size="lg" placeholder="Large textarea" />
  </FormItem>
</Space>`

const rowsSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="2行">
    <Textarea placeholder="2行文本域" :rows="2" />
  </FormItem>
  <FormItem label="4行">
    <Textarea placeholder="4行文本域" :rows="4" />
  </FormItem>
  <FormItem label="6行">
    <Textarea placeholder="6行文本域" :rows="6" />
  </FormItem>
</Space>`

const autoResizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="基础自动高度">
    <Textarea v-model="autoResizeText" autoResize placeholder="输入内容后将自动调整高度" />
  </FormItem>
  <FormItem label="限制行数 (3-8)">
    <Textarea autoResize :minRows="3" :maxRows="8" placeholder="最少 3 行，最多 8 行" />
  </FormItem>
</Space>`

const countSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="仅计数">
    <Textarea showCount placeholder="显示字符数" />
  </FormItem>
  <FormItem label="限制最大长度 (100)">
    <Textarea v-model="limited" showCount :maxLength="100" placeholder="最多 100 个字符" />
  </FormItem>
</Space>`

const disabledSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="禁用">
    <Textarea model-value="禁用的文本域" disabled :rows="3" />
  </FormItem>
  <FormItem label="只读">
    <Textarea model-value="只读的文本域" readonly :rows="3" />
  </FormItem>
  <FormItem label="必填">
    <Textarea placeholder="必填的文本域" required :rows="3" />
  </FormItem>
</Space>`

const combinedSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Textarea
    v-model="combined"
    autoResize
    :minRows="3"
    :maxRows="10"
    showCount
    :maxLength="500"
    placeholder="自动高度 + 字符计数 + 最大长度"
  />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Textarea 文本域</h1>
      <p class="text-gray-600">输入多行文本时使用。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="基础的文本域组件。" :code="basicSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Textarea v-model="text" placeholder="请输入内容" :rows="4" />
        <p class="text-sm text-gray-600">输入的内容：{{ text }}</p>
      </Space>
    </DemoBlock>

    <!-- 尺寸 -->
    <DemoBlock title="尺寸" description="支持 sm / md / lg 三种尺寸。" :code="sizeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="Small">
          <Textarea size="sm" placeholder="Small textarea" />
        </FormItem>
        <FormItem label="Medium">
          <Textarea size="md" placeholder="Medium textarea" />
        </FormItem>
        <FormItem label="Large">
          <Textarea size="lg" placeholder="Large textarea" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 不同行数 -->
    <DemoBlock title="不同行数" description="通过 rows 属性设置文本域的行数。" :code="rowsSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="2行">
          <Textarea placeholder="2行文本域" :rows="2" />
        </FormItem>
        <FormItem label="4行">
          <Textarea placeholder="4行文本域" :rows="4" />
        </FormItem>
        <FormItem label="6行">
          <Textarea placeholder="6行文本域" :rows="6" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 自动高度 -->
    <DemoBlock title="自动高度" description="通过 autoResize 启用自动高度，可配合 minRows / maxRows 限制范围。" :code="autoResizeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="基础自动高度">
          <Textarea v-model="autoResizeText" autoResize placeholder="输入内容后将自动调整高度" />
        </FormItem>
        <FormItem label="限制行数 (3-8)">
          <Textarea autoResize :minRows="3" :maxRows="8" placeholder="最少 3 行，最多 8 行" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 字符计数 -->
    <DemoBlock title="字符计数" description="通过 showCount 显示计数，可配合 maxLength 限制最大字符数。" :code="countSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="仅计数">
          <Textarea showCount placeholder="显示字符数" />
        </FormItem>
        <FormItem label="限制最大长度 (100)">
          <Textarea v-model="limited" showCount :maxLength="100" placeholder="最多 100 个字符" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 禁用、只读和必填 -->
    <DemoBlock title="禁用、只读和必填" description="文本域可以设置为禁用、只读或必填状态。" :code="disabledSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="禁用">
          <Textarea model-value="禁用的文本域" disabled :rows="3" />
        </FormItem>
        <FormItem label="只读">
          <Textarea model-value="只读的文本域" readonly :rows="3" />
        </FormItem>
        <FormItem label="必填">
          <Textarea placeholder="必填的文本域" required :rows="3" />
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 组合功能 -->
    <DemoBlock title="组合功能" description="autoResize + showCount + maxLength 组合使用。" :code="combinedSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Textarea v-model="combined" autoResize :minRows="3" :maxRows="10" showCount :maxLength="500"
          placeholder="自动高度 + 字符计数 + 最大长度" />
      </Space>
    </DemoBlock>
  </div>
</template>
