<script setup lang="ts">
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './DropdownDemo.vue?raw'

const visible1 = ref(false)
const lastCommand = ref('尚未选择操作')

const controlledScriptSnippet = `import { ref } from 'vue'

const visible1 = ref(false)`

const handleCommand = (command: string) => {
  const labels: Record<string, string> = { edit: '编辑', copy: '复制', delete: '删除' }
  lastCommand.value = labels[command] ?? command
}

const basicSnippet = `<Dropdown>
  <Button>悬浮触发</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
    <DropdownItem>菜单项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const triggerSnippet = `<div class="flex gap-4">
  <Dropdown trigger="hover">
    <Button>悬浮触发</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown trigger="click">
    <Button class="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-800 transition-colors">
      点击触发
    </Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const placementSnippet = `<div class="flex flex-col gap-4">
  <div class="flex gap-4">
    <Dropdown placement="bottom-start">
      <Button>底部-左对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="bottom">
      <Button>底部-居中</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="bottom-end">
      <Button>底部-右对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>

  <div class="flex gap-4">
    <Dropdown placement="top-start">
      <Button>顶部-左对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="top">
      <Button>顶部-居中</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Dropdown placement="top-end">
      <Button>顶部-右对齐</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</div>`

const disabledSnippet = `<div class="flex gap-4">
  <Dropdown disabled>
    <Button disabled>禁用的下拉菜单</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button>部分禁用</Button>
    <DropdownMenu>
      <DropdownItem>编辑</DropdownItem>
      <DropdownItem disabled>删除（已禁用）</DropdownItem>
      <DropdownItem>复制</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const dividedSnippet = `<Dropdown>
  <Button>操作菜单</Button>
  <DropdownMenu>
    <DropdownItem>编辑</DropdownItem>
    <DropdownItem>复制</DropdownItem>
    <DropdownItem divided>删除</DropdownItem>
    <DropdownItem>下载</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const clickSnippet = `<Dropdown>
  <Button>操作</Button>
  <DropdownMenu>
    <DropdownItem @click="handleCommand('edit')">编辑</DropdownItem>
    <DropdownItem @click="handleCommand('copy')">复制</DropdownItem>
    <DropdownItem @click="handleCommand('delete')" divided>删除</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const controlledSnippet = `<div class="flex gap-4 items-center">
  <Dropdown v-model:open="visible1">
    <Button>受控下拉菜单</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
  <Button @click="visible1 = !visible1">{{ visible1 ? '关闭' : '打开' }}下拉菜单</Button>
</div>`

const variantSnippet = `<div class="flex gap-4">
  <Dropdown>
    <Button variant="primary">主要按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button variant="secondary">次要按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <Dropdown>
    <Button variant="outline">轮廓按钮</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
      <DropdownItem>菜单项 3</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</div>`

const noArrowSnippet = `<Dropdown :show-arrow="false">
  <Button>无箭头指示器</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
    <DropdownItem>菜单项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const closeOnClickSnippet = `<Dropdown :close-on-click="false" trigger="click">
  <Button>点击不关闭</Button>
  <DropdownMenu>
    <DropdownItem>多选项 1</DropdownItem>
    <DropdownItem>多选项 2</DropdownItem>
    <DropdownItem>多选项 3</DropdownItem>
  </DropdownMenu>
</Dropdown>`

const defaultVisibleSnippet = `<Dropdown :default-open="true" trigger="click">
  <Button>默认展开</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
  </DropdownMenu>
</Dropdown>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dropdown 下拉菜单</h1>
      <p class="text-gray-600 dark:text-gray-400">向下弹出的列表菜单。</p>
    </div>

    <!-- 基本用法 -->
    <DemoBlock
      title="基本用法等组合展示"
      description="合并展示基本用法、触发方式、弹出位置等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Dropdown>
            <Button>悬浮触发</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
          <div class="flex gap-4">
            <Dropdown trigger="hover">
              <Button>悬浮触发</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown trigger="click">
              <Button
                class="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-800 transition-colors">
                点击触发
              </Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">弹出位置</h3>
          <div class="flex flex-col gap-4">
            <div class="flex gap-4">
              <Dropdown placement="bottom-start">
                <Button>底部-左对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="bottom">
                <Button>底部-居中</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="bottom-end">
                <Button>底部-右对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div class="flex gap-4">
              <Dropdown placement="top-start">
                <Button>顶部-左对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="top">
                <Button>顶部-居中</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown placement="top-end">
                <Button>顶部-右对齐</Button>
                <DropdownMenu>
                  <DropdownItem>菜单项 1</DropdownItem>
                  <DropdownItem>菜单项 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <div class="flex gap-4">
            <Dropdown disabled>
              <Button disabled>禁用的下拉菜单</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button>部分禁用</Button>
              <DropdownMenu>
                <DropdownItem>编辑</DropdownItem>
                <DropdownItem disabled>删除（已禁用）</DropdownItem>
                <DropdownItem>复制</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">分割线</h3>
          <Dropdown>
            <Button>操作菜单</Button>
            <DropdownMenu>
              <DropdownItem>编辑</DropdownItem>
              <DropdownItem>复制</DropdownItem>
              <DropdownItem divided>删除</DropdownItem>
              <DropdownItem>下载</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </DemoBlock>

    <!-- 点击事件 -->
    <DemoBlock
      title="点击事件"
      description="监听菜单项的点击事件，并在页面中回显最近操作。"
      :code="fullPageSnippet">
      <div class="space-y-3">
        <Dropdown>
          <Button>操作</Button>
          <DropdownMenu>
            <DropdownItem @click="handleCommand('edit')">编辑</DropdownItem>
            <DropdownItem @click="handleCommand('copy')">复制</DropdownItem>
            <DropdownItem @click="handleCommand('delete')" divided>删除</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
          最近操作：{{ lastCommand }}
        </p>
      </div>
    </DemoBlock>

    <!-- 受控模式 -->
    <DemoBlock
      title="受控模式"
      description="通过 v-model:open 控制下拉菜单的显示隐藏。"
      :code="fullPageSnippet">
      <div class="flex gap-4 items-center">
        <Dropdown v-model:open="visible1">
          <Button>受控下拉菜单</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button @click="visible1 = !visible1"> {{ visible1 ? '关闭' : '打开' }}下拉菜单 </Button>
      </div>
    </DemoBlock>

    <!-- 多种按钮 -->
    <DemoBlock
      title="多种按钮样式等组合展示"
      description="合并展示多种按钮样式、无箭头指示器、点击不关闭等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多种按钮样式</h3>
          <div class="flex gap-4">
            <Dropdown>
              <Button variant="primary">主要按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button variant="secondary">次要按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <Button variant="outline">轮廓按钮</Button>
              <DropdownMenu>
                <DropdownItem>菜单项 1</DropdownItem>
                <DropdownItem>菜单项 2</DropdownItem>
                <DropdownItem>菜单项 3</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">无箭头指示器</h3>
          <Dropdown :show-arrow="false">
            <Button>无箭头指示器</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">点击不关闭</h3>
          <Dropdown :close-on-click="false" trigger="click">
            <Button>点击不关闭</Button>
            <DropdownMenu>
              <DropdownItem>多选项 1</DropdownItem>
              <DropdownItem>多选项 2</DropdownItem>
              <DropdownItem>多选项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">默认展开</h3>
          <Dropdown :default-open="true" trigger="click">
            <Button>默认展开</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
