<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem, Button, Divider } from '@tigercat/vue'

const visible1 = ref(false)

const handleCommand = (command: string) => {
  console.log('点击了：', command)
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dropdown 下拉菜单</h1>
      <p class="text-gray-600">向下弹出的列表菜单。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">悬停在触发元素上时显示下拉菜单。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Dropdown>
          <Button>悬浮触发</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 触发方式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">触发方式</h2>
      <p class="text-gray-600 mb-6">支持点击和悬浮两种触发方式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
            <Button>点击触发</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 弹出位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">弹出位置</h2>
      <p class="text-gray-600 mb-6">支持 12 种弹出位置。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用整个下拉菜单或单个菜单项。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      <Divider class="my-6" />
    </section>

    <!-- 分割线 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">分割线</h2>
      <p class="text-gray-600 mb-6">使用 divided 属性在菜单项之间添加分割线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      <Divider class="my-6" />
    </section>

    <!-- 点击事件 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">点击事件</h2>
      <p class="text-gray-600 mb-6">监听菜单项的点击事件（查看控制台）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Dropdown>
          <Button>操作</Button>
          <DropdownMenu>
            <DropdownItem @click="handleCommand('edit')">编辑</DropdownItem>
            <DropdownItem @click="handleCommand('copy')">复制</DropdownItem>
            <DropdownItem @click="handleCommand('delete')" divided>删除</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 受控模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">受控模式</h2>
      <p class="text-gray-600 mb-6">通过 v-model:visible 控制下拉菜单的显示隐藏。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="flex gap-4 items-center">
          <Dropdown v-model:visible="visible1">
            <Button>受控下拉菜单</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button @click="visible1 = !visible1">
            {{ visible1 ? '关闭' : '打开' }}下拉菜单
          </Button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多种按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多种按钮样式</h2>
      <p class="text-gray-600 mb-6">下拉菜单可以搭配不同样式的按钮使用。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
    </section>
  </div>
</template>
